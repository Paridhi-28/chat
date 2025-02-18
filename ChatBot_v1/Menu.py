Everything=[
            {"Chat GPT":[
                         {"GPT-4o":[
                                    {"GPT-4o Stable":"gpt-4o"},
                                    {"GPT-4o Latest":"chatgpt-4o-latest"},
                                    {"GPT-4o 20th Nov, 2024":"gpt-4o-2024-11-20"},
                                    {"GPT-4o 6th Aug, 2024":"gpt-4o-2024-08-06"},
                                    {"GPT-4o 13th May, 2024":"gpt-4o-2024-05-13"}
                                   ]
                         },
                         {"GPT-4o mini":[
                                         {"GPT-4o mini Stable":"gpt-4o-mini"},
                                         {"GPT-4o Latest":"gpt-4o-mini-2024-07-18"},
                                         {"GPT-4o mini 18th Jul, 2024":"gpt-4o-mini-2024-07-18"}
                                        ]
                         },
                         {"o1 preview":[
                                        {"o1 preview Stable":"o1-preview"},
                                        {"o1 preview Latest":"o1-preview-2024-09-12"},
                                        {"o1 preview 12th Sep, 2024":"o1-preview-2024-09-12"}
                                       ]
                         },
                         {"o1 mini":[
                                     {"o1 mini Stable":"o1-mini"},
                                     {"o1 mini Latest":"o1-mini-2024-09-12"},
                                     {"o1 mini 12th Sep, 2024":"o1-mini-2024-09-12"}
                                    ]
                         },
                         {"GPT-4":[
                                   {"GPT-4 Stable":"gpt-4"},
                                   {"GPT-4 Latest":"gpt-4-0613"},
                                   {"GPT-4 13th Jun, 2024":"gpt-4-0613"}
                                  ]
                         },
                         {"GPT-4 Turbo":[
                                         {"GPT-4 Turbo Stable":"gpt-4-Turbo"},
                                         {"GPT-4 Turbo Latest":"gpt-4-turbo-2024-04-09"},
                                         {"GPT-4 Turbo 9th Apr, 2024":"gpt-4-turbo-2024-04-09"},
                                         {"GPT-4 Turbo preview Stable":"gpt-4-turbo-preview"},
                                         {"GPT-4 Turbo preview Latest":"gpt-4-0125-preview"},
                                         {"GPT-4 Turbo preview 25th Jan, 2024":"gpt-4-0125-preview"},
                                         {"GPT-4 Turbo preview 6th Nov, 2023":"gpt-4-1106-preview"}
                                        ]
                         },
                         {"GPT-3.5 Turbo":[
                                           {"GPT-3.5 Turbo Stable":"gpt-3.5-turbo"},
                                           {"GPT-3.5 Turbo Latest":"gpt-3.5-turbo-0125"},
                                           {"GPT-3.5 Turbo 25th Jan, 2024":"gpt-3.5-turbo-0125"},
                                           {"GPT-3.5 Turbo 6th Nov, 2023":"gpt-3.5-turbo-1106"}
                                          ]
                         }
                        ]
            },
            {"Anthropic": [
                            {"Claude 3.5 Sonnet": [
                                                   {"Claude 3.5 Sonnet Latest": "claude-3-5-sonnet-latest"},
                                                   {"Claude 3.5 Sonnet 22nd Oct, 2024": "claude-3-5-sonnet-20241022"}
                                                  ]
                            },
                            {"Claude 3.5 Haiku": [
                                                  {"Claude 3.5 Haiku Latest": "claude-3-5-haiku-latest"},
                                                  {"Claude 3.5 Haiku 22nd Oct, 2024": "claude-3-5-haiku-20241022"}
                                                 ]
                            },
                            {"Claude 3 Opus": [
                                                {"Claude 3 Opus Latest": "claude-3-opus-latest"},
                                                {"Claude 3 Opus 29th Feb, 2024": "claude-3-opus-20240229"}
                                              ]
                            },
                            {"Claude 3 Sonnet": [
                                                 {"Claude 3 Sonnet Latest": "claude-3-sonnet-latest"},
                                                 {"Claude 3 Sonnet 29th Feb, 2024": "claude-3-sonnet-20240229"}
                                                ]
                            },
                            {"Claude 3 Haiku": [
                                                {"Claude 3 Haiku Latest": "claude-3-haiku-latest"},
                                                {"Claude 3 Haiku 7th Mar, 2024": "claude-3-haiku-20240307"}
                                               ]
                            },
                            {"Claude 2.1": [
                                            {"Claude 2.1": "claude-2.1"}
                                           ]
                            },
                            {"Claude 2": [
                                          {"Claude 2": "claude-2.0"}
                                         ]
                            }
                           ]
            },
            {"xAI": [
                     {"Grok": [
                                {"Grok beta": "grok-beta"}
                               ]
                     },
                     {"Grok Vision": [
                                      {"Grok Vision beta": "grok-vision-beta"}
                                     ]
                     }
                    ]
            },
            {"Gemini": [
                        {"Gemini 1.5 Flash": [
                                              {"Gemini 1.5 Flash Latest": "gemini-1.5-flash-latest"},
                                              {"Gemini 1.5 Flash Stable": "gemini-1.5-flash"},
                                              {"Gemini 1.5 Flash Latest": "gemini-1.5-flash"},
                                              {"Gemini 1.5 Flash Latest": "gemini-1.5-flash"}
                                             ]
                        },
                        {"Gemini 1.5 Flash-8B": [
                                                 {"Gemini 1.5 Flash-8B": "gemini-1.5-flash-8b"}
                                                ]
                        },
                        {"Gemini 1.5 Pro": [
                                            {"Gemini 1.5 Pro": "gemini-1.5-pro"}
                                           ]
                        },
                        {"Gemini 1.0 Pro ": [
                                             {"Gemini 1.0 Pro": "gemini-1.0-pro"}
                                            ]
                        },
                        {"Text Embedding": [
                                            {"Text Embedding 004": "text-embedding-004"}
                                           ]
                        },
                        {"AQA": [
                                 {"AQA": "aqa"}
                                ]
                        }
                       ]
            }
]
code=''


def select_category():
    global code
    categories = []
    # Loop through the outer list (Everything) and collect the categories
    for category_dict in Everything:
        categories.extend(category_dict.keys())

    print("Select a category:")
    for i, category in enumerate(categories):
        print(f"{i + 1}. {category}")

    user_input = input("Enter category number: ")
    code += str(user_input)
    choice = int(user_input) - 1
    return categories[choice]


def select_model(models):
    global code
    print("\nSelect a model:")
    for i, model in enumerate(models):
        model_name = list(model.keys())[0]
        print(f"{i + 1}. {model_name}")
    user_input = input("Enter model number: ")
    code += str(user_input)
    choice = int(user_input) - 1
    return models[choice]


def select_version(versions):
    global code
    print("\nSelect a version:")
    for i, version in enumerate(versions):
        version_name = list(version.keys())[0]
        print(f"{i + 1}. {version_name}")
    user_input = input("Enter version number: ")
    code += str(user_input)
    choice = int(user_input) - 1
    return versions[choice]


def handle_direct_category(category_name):
    category_found = False

    # Find if the category exists in Everything
    for category in Everything:
        if category_name in category:
            category_found = True
            models = category[category_name]
            selected_model = select_model(models)
            model_name = list(selected_model.keys())[0]
            versions = selected_model[model_name]
            selected_version = select_version(versions)
            version_name = list(selected_version.keys())[0]
            version_id = selected_version[version_name]

            # Display selected version and ID
            return category, version_id, code


def menu(category_name=None):
    global code
    code=''
    if category_name:
        return handle_direct_category(category_name)
    else:
        # Step 1: Select category
        category = select_category()

        # Step 2: Find models based on selected category
        models = None
        for category_dict in Everything:
            if category in category_dict:
                models = category_dict[category]
                break

        if models is None:
            print("Category not found!")
            return None

        # Step 3: Select model
        selected_model = select_model(models)
        model_name = list(selected_model.keys())[0]
        versions = selected_model[model_name]

        # Step 4: Select version
        selected_version = select_version(versions)
        version_name = list(selected_version.keys())[0]
        version_id = selected_version[version_name]

        # Step 5: Display selected version ID
        return category, version_id, code