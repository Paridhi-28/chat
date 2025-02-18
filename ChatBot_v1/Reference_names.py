role_name= ''
user_role_reference_name= ''
chatbot_role_reference_name= ''
io_text_name= ''

def names(code):
    global role_name
    global user_role_reference_name
    global chatbot_role_reference_name
    global io_text_name
    match code:
        case '111'|'112'|'113'|'114'|'115'|'121'|'122'|'123'|'131'|'132'|'133'|'141'|'142'|'143'|'151'|'152'|'153'|'161'|'162'|'163'|'164'|'165'|'166'|'167'|'171'|'172'|'173'|'174'|\
             '211'|'212'|'221'|'222'|'231'|'232'|'241'|'242'|'251'|'252'|'261'|'271'|\
             '311'|'312':
            role_name = 'role'
            user_role_reference_name = 'user'
            chatbot_role_reference_name = 'assistant'
            io_text_name = 'content'

        case '411'|'412'|'413'|'414'|'421'|'431'|'441'|'451'|'461':
            role_name = 'role'
            user_role_reference_name = 'user'
            chatbot_role_reference_name = 'model'
            io_text_name = 'parts'