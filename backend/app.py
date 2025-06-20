from google import genai

client = genai.Client(api_key="AIzaSyD8jmT7tMl7Oymvl3zMoDe33DLWE86FuMU")

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="Give me tips to build Chrome extension"
)
print(response.text)

