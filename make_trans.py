import sys
from PIL import Image

try:
    img = Image.open('public/assets/patamu_pencil.png')
    img = img.convert("RGBA")
    datas = img.getdata()
    
    # Get the background color from the top-left pixel
    bg_color = datas[0]
    
    newData = []
    for item in datas:
        if abs(item[0]-bg_color[0]) < 20 and abs(item[1]-bg_color[1]) < 20 and abs(item[2]-bg_color[2]) < 20:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save('public/assets/patamu_pencil.png', "PNG")
    print("Made transparent.")
except Exception as e:
    print(f"Error: {e}")
