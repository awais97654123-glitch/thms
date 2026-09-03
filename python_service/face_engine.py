"""
The Hayatabad Model School - Real Face Recognition Engine
Extracts facial features (HOG landmarks + Local Binary Pattern micro-textures)
and matches live camera scans against enrolled student admission photos.
"""

import sys
import os
import io
import json
import base64
import argparse
import ssl
import urllib.request
import numpy as np
from PIL import Image, ImageOps, ImageEnhance

try:
    from skimage.feature import hog, local_binary_pattern
except ImportError:
    print("Warning: skimage not found, installing or falling back...", file=sys.stderr)
    hog = None
    local_binary_pattern = None

# Relaxed SSL context for downloading admission photos from cloud/https
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE


def load_image_from_source(source: str) -> Image.Image:
    """
    Loads an image from a base64 data URL, base64 string, HTTP/HTTPS URL, or local file path.
    """
    if not source:
        raise ValueError("Empty image source provided")

    source = str(source).strip()

    # 1. Base64 data URL (e.g. data:image/jpeg;base64,...)
    if source.startswith("data:image"):
        parts = source.split(",", 1)
        if len(parts) > 1:
            raw_b64 = parts[1]
        else:
            raw_b64 = parts[0]
        image_bytes = base64.b64decode(raw_b64)
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # 2. Raw base64 string
    if len(source) > 200 and (" " not in source) and not source.startswith("http") and not os.path.exists(source):
        try:
            image_bytes = base64.b64decode(source)
            return Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception:
            pass

    # 3. HTTP / HTTPS URL
    if source.startswith("http://") or source.startswith("https://"):
        req = urllib.request.Request(
            source,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        )
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=10) as response:
            data = response.read()
            return Image.open(io.BytesIO(data)).convert("RGB")

    # 4. Local File Path
    if os.path.exists(source):
        return Image.open(source).convert("RGB")

    # If all fails, attempt base64 decode as last resort
    try:
        image_bytes = base64.b64decode(source)
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Could not load image from source: {e}")


def preprocess_face_image(img: Image.Image, target_size=(128, 128)) -> np.ndarray:
    """
    Standardizes image: Auto-contrast, grayscale conversion, resize to target_size,
    and lighting normalization.
    """
    # Auto-level contrast
    img_contrast = ImageOps.autocontrast(img, cutoff=2)
    # Convert to grayscale
    gray_img = img_contrast.convert("L")
    # Resize to standard dimensions for feature alignment
    resized_img = gray_img.resize(target_size, Image.Resampling.LANCZOS)
    # Convert to uint8 numpy array
    arr = np.array(resized_img, dtype=np.uint8)
    return arr


def extract_face_signature(img_arr: np.ndarray) -> np.ndarray:
    """
    Extracts a high-dimensional facial signature vector:
    1. Multi-scale HOG (facial geometry: eyes, eyebrows, nose, mouth contours).
    2. Local Binary Patterns (LBP micro-textures: skin, facial structure).
    3. Spatial brightness and central profile.
    """
    h, w = img_arr.shape

    # 1. HOG Feature Extraction
    if hog is not None:
        hog_features = hog(
            img_arr,
            orientations=8,
            pixels_per_cell=(16, 16),
            cells_per_block=(2, 2),
            block_norm='L2-Hys'
        )
    else:
        # Fallback gradient representation
        gx = np.gradient(img_arr.astype(np.float32), axis=1)
        gy = np.gradient(img_arr.astype(np.float32), axis=0)
        mag = np.hypot(gx, gy)
        hog_features = mag.flatten()[::16]

    # 2. Local Binary Patterns (LBP) on a 4x4 spatial grid
    if local_binary_pattern is not None:
        # Uniform LBP with P=8, R=1
        lbp = local_binary_pattern(img_arr, P=8, R=1, method='uniform')
        # Divide into 4x4 cells (32x32 each)
        grid_rows, grid_cols = 4, 4
        cell_h, cell_w = h // grid_rows, w // grid_cols
        lbp_histograms = []

        for r in range(grid_rows):
            for c in range(grid_cols):
                cell = lbp[r*cell_h:(r+1)*cell_h, c*cell_w:(c+1)*cell_w]
                hist, _ = np.histogram(cell.ravel(), bins=10, range=(0, 10))
                # Normalize cell histogram
                hist_norm = hist.astype(np.float32) / (hist.sum() + 1e-7)
                lbp_histograms.extend(hist_norm)
        lbp_vec = np.array(lbp_histograms, dtype=np.float32)
    else:
        lbp_vec = np.zeros(160, dtype=np.float32)

    # 3. Central facial region weight (where eyes, nose, mouth are located)
    center_y1, center_y2 = h // 4, 3 * (h // 4)
    center_x1, center_x2 = w // 4, 3 * (w // 4)
    central_patch = img_arr[center_y1:center_y2, center_x1:center_x2].astype(np.float32)
    central_profile = central_patch.flatten()[::8] / 255.0

    # 4. Concatenate all feature representations
    combined = np.concatenate([
        hog_features.astype(np.float32),
        lbp_vec.astype(np.float32),
        central_profile.astype(np.float32)
    ])

    # 5. L2-normalization for cosine distance metric
    norm = np.linalg.norm(combined)
    if norm > 1e-7:
        combined = combined / norm

    return combined


def calculate_face_similarity(sig1: np.ndarray, sig2: np.ndarray) -> float:
    """
    Computes a combined cosine similarity and correlation score between two normalized signatures.
    Returns score normalized from 0.0 to 1.0 (0% to 100%).
    """
    # Cosine similarity
    cosine = float(np.dot(sig1, sig2))

    # Pearson correlation coefficient
    try:
        corr = float(np.corrcoef(sig1, sig2)[0, 1])
        if np.isnan(corr):
            corr = cosine
    except Exception:
        corr = cosine

    # Weighted blend: Cosine (70%) + Pearson Correlation (30%)
    score = (0.70 * max(0.0, cosine)) + (0.30 * max(0.0, corr))
    return float(np.clip(score, 0.0, 1.0))


def verify_two_faces(live_source: str, admission_source: str, threshold: float = 70.0) -> dict:
    """
    Compares a live camera scan against a student's admission photo.
    Returns:
      {
        "matched": bool,
        "confidence": float (percentage e.g. 92.4),
        "score": float (0.0 - 1.0),
        "threshold": float,
        "message": str
      }
    """
    try:
        live_img = load_image_from_source(live_source)
        adm_img = load_image_from_source(admission_source)

        live_prep = preprocess_face_image(live_img)
        adm_prep = preprocess_face_image(adm_img)

        live_sig = extract_face_signature(live_prep)
        adm_sig = extract_face_signature(adm_prep)

        sim_score = calculate_face_similarity(live_sig, adm_sig)
        confidence = round(sim_score * 100.0, 1)

        matched = confidence >= threshold

        return {
            "success": True,
            "matched": matched,
            "confidence": confidence,
            "score": round(sim_score, 4),
            "threshold": threshold,
            "message": (
                f"Face matched with {confidence}% confidence"
                if matched else
                f"Face mismatch ({confidence}% confidence, required {threshold}%)"
            )
        }
    except Exception as e:
        return {
            "success": False,
            "matched": False,
            "confidence": 0.0,
            "score": 0.0,
            "threshold": threshold,
            "error": str(e),
            "message": f"Face verification failed: {e}"
        }


def identify_live_face(live_source: str, candidates: list, threshold: float = 68.0) -> dict:
    """
    Scans a live face against a list of candidate students (each with id, studentId, fullName, photoUrl).
    Returns the top matching student if confidence >= threshold.
    """
    try:
        live_img = load_image_from_source(live_source)
        live_prep = preprocess_face_image(live_img)
        live_sig = extract_face_signature(live_prep)

        best_candidate = None
        best_confidence = 0.0
        best_score = 0.0

        for cand in candidates:
            photo_url = cand.get("photoUrl")
            if not photo_url:
                continue

            try:
                cand_img = load_image_from_source(photo_url)
                cand_prep = preprocess_face_image(cand_img)
                cand_sig = extract_face_signature(cand_prep)

                score = calculate_face_similarity(live_sig, cand_sig)
                conf = round(score * 100.0, 1)

                if conf > best_confidence:
                    best_confidence = conf
                    best_score = score
                    best_candidate = cand
            except Exception as e:
                # Skip invalid individual photo URLs without crashing search
                continue

        matched = best_candidate is not None and best_confidence >= threshold

        return {
            "success": True,
            "matched": matched,
            "student": best_candidate if matched else None,
            "confidence": best_confidence,
            "score": round(best_score, 4),
            "threshold": threshold,
            "message": (
                f"Student identified as {best_candidate.get('fullName', '')} ({best_confidence}% match)"
                if matched else
                f"No matching student found. Highest confidence was {best_confidence}% (needed {threshold}%)."
            )
        }
    except Exception as e:
        return {
            "success": False,
            "matched": False,
            "confidence": 0.0,
            "score": 0.0,
            "threshold": threshold,
            "error": str(e),
            "message": f"Face identification failed: {e}"
        }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="The Hayatabad Model School Face Recognition Engine")
    parser.add_argument("--mode", choices=["verify", "identify", "test"], default="test")
    parser.add_argument("--live", help="Live face image (base64, URL, or filepath)")
    parser.add_argument("--admission", help="Admission photo (base64, URL, or filepath)")
    parser.add_argument("--candidates", help="JSON string or file with candidate students")
    parser.add_argument("--threshold", type=float, default=70.0)

    args = parser.parse_args()

    if args.mode == "verify":
        res = verify_two_faces(args.live, args.admission, args.threshold)
        print(json.dumps(res))
    elif args.mode == "identify":
        try:
            candidates_data = json.loads(args.candidates)
        except Exception:
            candidates_data = []
        res = identify_live_face(args.live, candidates_data, args.threshold)
        print(json.dumps(res))
    elif args.mode == "test":
        print(json.dumps({
            "status": "ready",
            "engine": "The Hayatabad Model School Real Face Recognition Engine",
            "python_version": sys.version,
            "skimage_available": hog is not None
        }))
