from linebot.models import MessageEvent, TextMessage, TextSendMessage, ImageSendMessage, StickerSendMessage, LocationSendMessage, QuickReply, QuickReplyButton, MessageAction
from linebot.models import MessageEvent, TextMessage, PostbackEvent, TextSendMessage, TemplateSendMessage, ConfirmTemplate, MessageTemplateAction, ButtonsTemplate, PostbackTemplateAction, URITemplateAction, CarouselTemplate, CarouselColumn, ImageCarouselTemplate, ImageCarouselColumn
from linebot.models import FlexSendMessage, BubbleContainer, ImageComponent
from linebot.exceptions import InvalidSignatureError
from linebot import LineBotApi, WebhookHandler
from flask import request, abort
from flask import Flask
import requests
from bs4 import BeautifulSoup
import random

app = Flask(__name__)

line_bot_api = LineBotApi(
    'H3vdszyTPhXl7qusTmPYIWQubOxEAdUzWos/ULDzgl19esatYRFOZn2zZmuGLNrDESuy2qgBfznf2yTuS6vAwksHAgS4VCaLJfFkjtQ4nGD+Zwmm0QiCwWywJ7YwAZXhfv88/H10Ae8QyH+D/iFJ7QdB04t89/1O/w1cDnyilFU=')
handler = WebhookHandler('df62d3c284e83f6144907d24d3cf8586')


@app.route("/callback", methods=['POST'])
def callback():
    # get X-Line-Signature header value
    signature = request.headers['X-Line-Signature']

    # get request body as text
    body = request.get_data(as_text=True)
    app.logger.info("Request body: " + body)

    # handle webhook body
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        print("Invalid signature. Please check your channel access token/channel secret.")
        abort(400)

    return 'OK'


@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    mtext = event.message.text
    if mtext == '@螢幕報修':
        try:
            message = TextSendMessage(
                text="我是 Linebot，\n您好！"
            )
            line_bot_api.reply_message(event.reply_token, message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '@我要報修':
        try:
            message = TextSendMessage(
                text="請輸入電話號碼，給您對應此社區的報修單資料。"
            )
            line_bot_api.reply_message(event.reply_token, message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '@傳送文字':
        try:
            message = TextSendMessage(
                text="我是 Linebot，\n您好！"
            )
            line_bot_api.reply_message(event.reply_token, message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext.isdigit()==True:
        try:
            phone = mtext
            url = f'http://test.eiptv.net:99/api/LineRepair/{(phone)}'
            r = requests.get(url)
            soup = str(BeautifulSoup(r.text,"html.parser"))
            lineData = soup
            
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text="請點選下方的專屬連結進行報修程序，我們會盡快幫您處理，謝謝"+'\n\n'+ lineData))
            
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='電話號碼輸入錯誤，請重新輸入'))

    # 簡易維修
    # elif '螢幕問題' in mtext or '廣告停格' in mtext or '公告不顯示' in mtext or '公告問題' in mtext or '公告無法顯示' in mtext:
    #     try:
    #         # 接受 1MB 以下的 JPG 圖檔，網址必須是 https 開頭
    #         message = ImageSendMessage(
    #             original_content_url="https://i.imgur.com/MW9Kgo4.png",
    #             preview_image_url="https://i.imgur.com/MW9Kgo4.png"
    #         )
    #         line_bot_api.reply_message(event.reply_token, message)
    #     except:
    #         line_bot_api.reply_message(
    #             event.reply_token, TextSendMessage(text='發生錯誤！'))

    
    
    elif mtext == '@傳送貼圖':
        try:
            message = StickerSendMessage(  # 貼圖兩個id需查表
                package_id='1',
                sticker_id='2'
            )
            line_bot_api.reply_message(event.reply_token, message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '@多項傳送':
        try:
            message = [  # 串列
                StickerSendMessage(  # 傳送貼圖
                    package_id='1',
                    sticker_id='2'
                ),
                TextSendMessage(  # 傳送文字
                    text="這是 Pizza 圖片！"
                ),
                ImageSendMessage(  # 傳送圖片
                    original_content_url="https://i.imgur.com/4QfKuz1.png",
                    preview_image_url="https://i.imgur.com/4QfKuz1.png"
                )
            ]
            line_bot_api.reply_message(event.reply_token, message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '查詢':
        try:
            tempData = []
            url = 'https://opensheet.elk.sh/1aONuHicIqXMpL9EyO6HkPkgqSF2SgXabHKnCvN627L0/Q&A'
            headers = {
                "user-agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
            }
            r_command = requests.get(url, headers=headers)
            data_command = r_command.json()
            for i in data_command[0:4]:
                order = i.get("question")
                orderContent = i.get("answer")
                tempData += [order+' - '+orderContent]
            
            message = [{
                "type": "text",
                "text": "這裡是要回應的文字"
            }]
            # message = TextSendMessage(text='分眾+的問題排除查詢指令如下 :'+'\n\n'+ '\n'.join(tempData))
            # message = TextSendMessage(
            #     title='分眾+的問題排除查詢指令如下 :'+ '\n\n' + orderContent + '\n'
            # )
            line_bot_api.reply_message(event.reply_token,message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='查詢指令輸入錯誤'))


    elif mtext == '@傳送位置':
        try:
            message = LocationSendMessage(
                title='101大樓',
                address='台北市信義路五段7號',
                latitude=25.034207,  # 緯度
                longitude=121.564590  # 經度
            )
            line_bot_api.reply_message(event.reply_token, message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

def reportFixEvent(event):
    try:
        message = TextSendMessage(
                text="您好，報修請輸入'電話'＋'社區市話號碼',社區市話或聯絡人電話，即可報修"+"\n"+
"EX：電話02-2334-5678，手機格式，EX:電話0912-345-678"
            )
        line_bot_api.reply_message(event.reply_token, message)
    except:
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text='社區電話號碼輸入錯誤，請按照格式，電話 + 社區市話號碼，例如:電話02-2334-5678，或者電話0912-345-678，再輸入一次！'))

if __name__ == '__main__':
    app.run(port=2000)
