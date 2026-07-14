import sys
import shutil
import os

try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

# 1. Copy Patamu logo
shutil.copyfile('../patamu_logo_transparent.png', 'public/assets/patamu.png')

# 2. Make white transparent in court_emblem
try:
    img = Image.open('public/assets/court_emblem.png')
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # replace white-ish background
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save('public/assets/court_emblem.png', "PNG")
    print("Background removed.")
except Exception as e:
    print(f"Error processing image: {e}")

