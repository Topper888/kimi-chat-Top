from zhipuai import ZhipuAI

class ImageGenerator:
    def __init__(self, api_key):
        self.client = ZhipuAI(api_key=api_key)
        
    def generate_image(self, prompt):
        try:
            # Ensure prompt is a string
            if not isinstance(prompt, str):
                raise ValueError("Prompt must be a string")

            response = self.client.images.generations(
                model="cogView-3-plus",
                prompt=prompt,
                size="1024x1024"
            )
            
            # Add error handling for the response
            if not response or not hasattr(response, 'data') or not response.data:
                raise Exception("Invalid response from API")
                
            return {"url": response.data[0].url}
            
        except Exception as e:
            print(f"Error generating image: {str(e)}")
            error_msg = str(e)
            # Check if it's a JSON response with error message
            if "error" in error_msg and "message" in error_msg:
                try:
                    import json
                    error_data = json.loads(error_msg[error_msg.index("{"):])
                    if "error" in error_data and "message" in error_data["error"]:
                        return {"error": error_data["error"]["message"]}
                except:
                    pass
            return {"error": error_msg} 