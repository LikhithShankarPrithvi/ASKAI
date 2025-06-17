from google import genai

client = genai.Client(api_key="AIzaSyD8jmT7tMl7Oymvl3zMoDe33DLWE86FuMU")

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="Explain how AI works in a few words"
)
print(response.text)