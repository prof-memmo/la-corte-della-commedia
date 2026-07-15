from PIL import Image

def remove_white(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if the pixel is near white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

remove_white("/Users/guglielmopiersanti/.gemini/antigravity-ide/brain/5c7bfc42-fd59-46d2-ba3a-8a8b355b4dbd/dante_full_body_1784065900893.png", "public/assets/dante_full.png")
remove_white("/Users/guglielmopiersanti/.gemini/antigravity-ide/brain/5c7bfc42-fd59-46d2-ba3a-8a8b355b4dbd/difesa_full_body_1784065916479.png", "public/assets/difesa_full.png")
