import sys
from PIL import Image

try:
    img = Image.open('public/assets/main_logo.png')
    img = img.convert("RGBA")
    datas = img.getdata()
    
    # Get the background color from the top-left pixel
    bg_color = datas[0]
    
    newData = []
    for item in datas:
        # If the pixel is very close to the background color, make it transparent
        if abs(item[0] - bg_color[0]) < 10 and abs(item[1] - bg_color[1]) < 10 and abs(item[2] - bg_color[2]) < 10:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save('public/assets/main_logo.png', "PNG")
    print("Background removed from main_logo.png")
except Exception as e:
    print(f"Error: {e}")
