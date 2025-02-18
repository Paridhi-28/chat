# Required Libraries
import openai
import anthropic
import requests
import google.generativeai as gemini

# Prebuilt Libraries
from dotenv import load_dotenv
import os

# Files Called
import Menu
import Reference_names
load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
xAI_api_key=os.getenv("XAI_API_KEY")
gemini.configure(api_key=os.getenv('GEMINI_API_KEY'))

def evaluate_dict(d):
    result = {}
    for key, val in d.items():
        # If the key is a callable (like a lambda), evaluate it
        if callable(key):
            evaluated_key = key()  # Call the lambda function to evaluate the key
        else:
            evaluated_key = key  # Leave the key as is if it's not callable

        # If the value is a callable (like a lambda), evaluate it
        if callable(val):
            evaluated_val = val()  # Call the lambda function to evaluate the value
        else:
            evaluated_val = val  # Leave the value as is if it's not callable

        result[evaluated_key] = evaluated_val  # Add the evaluated key-value pair to the result
    return result


def process_messages(messages):
    # Process each message (which could be a dictionary) with evaluate_dict
    return list(map(evaluate_dict, messages))

messages = []
processed_message=process_messages(messages)
chatbot, model, code = Menu.menu()
Reference_names.names(code)

if model.find("gemini") != -1:
    chat = gemini.GenerativeModel(model).start_chat(history=processed_message)

while True:

    message = input("You: ")

    if message.lower() == "quit()":
        break

    if message.lower() == "change_model()":
        chatbot, model, code = Menu.menu()
        Reference_names.names(code)
        processed_message=process_messages(messages)
        if model.find("gemini")!=-1:
            chat = gemini.GenerativeModel(model).start_chat(history=processed_message)
        continue

    messages.append({lambda:Reference_names.role_name : lambda:Reference_names.user_role_reference_name , lambda:Reference_names.io_text_name : message})
    processed_message.append(evaluate_dict(messages[-1]))

    if model.find("gpt")!=-1:
        response = openai.chat.completions.create(
            model=model,
            messages=processed_message)
        reply = response.choices[0].message.content

    elif model.find("claude")!=-1:
        response = client.messages.create(
                   model=model,
                   max_tokens=1024,
                   messages=processed_message)
        reply = response.content[0].text
        chatbot="Claude"

    elif model.find("grok")!=-1:
        response = requests.post(
            "https://api.x.ai/v1/chat/completions",
            json={"messages": processed_message,
                  "model": model,
                  },
            headers={"Content-Type": "application/json",
                     "Authorization": f"Bearer {xAI_api_key}"
                     })
        reply = response.json()['choices'][0]['message']['content']
        chatbot="Grok"

    elif model.find("gemini")!=-1:
        response = chat.send_message(message)
        reply = response.text
        chatbot="Gemini"

    messages.append({lambda:Reference_names.role_name : lambda:Reference_names.chatbot_role_reference_name, lambda:Reference_names.io_text_name : reply})
    processed_message.append(evaluate_dict(messages[-1]))

    print(chatbot+" ("+model+"): " + reply)
