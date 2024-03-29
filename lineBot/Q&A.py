from linebot.models import MessageEvent, TextMessage, TextSendMessage, ImageSendMessage, StickerSendMessage, LocationSendMessage, QuickReply, QuickReplyButton, MessageAction
from linebot.models import MessageEvent, TextMessage, PostbackEvent,VideoSendMessage, TextSendMessage, TemplateSendMessage, ConfirmTemplate, MessageTemplateAction, ButtonsTemplate, PostbackTemplateAction, URITemplateAction, CarouselTemplate, CarouselColumn, ImageCarouselTemplate, ImageCarouselColumn
from linebot.models import FlexSendMessage, BubbleContainer, ImageComponent
from linebot.exceptions import InvalidSignatureError
from linebot import LineBotApi, WebhookHandler
from flask import request, abort
from flask import Flask
import requests
from bs4 import BeautifulSoup
import random
import re

app = Flask(__name__)
line_bot_api = LineBotApi(
    'YCCNyRNBgMipYEWyP1e4zCaq3dIoHcQyRxmcmucftlIawtiEL3Xnq2lKZJp3IdVGnOkaNjql8eYk9+tOjF+XbOCibL69xGntGC7Uxs2ooaWBJGNL7x3/RRAeEqq8J5kEH3P50PDGFBJZp9KN7hyE5QdB04t89/1O/w1cDnyilFU=')
handler = WebhookHandler('5225eef73cd7214b418352c9066a61b6')

status = {'test':'s1'}

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
    # userId = event.source.user_id
    mtext = event.message.text
    userId = event.source.user_id
    profile = line_bot_api.get_profile(userId)
    userName = profile.display_name
    print("The type is :", type(userId))
    print("使用者id 是 :", userId )
    print("使用者名稱 是:", userName )
    
    global status
    
    # 狀態是空的，開始一般問答
    if status.get(userId) == None or status.get(userId) == '':
    
        if mtext == '報修':
            sendCarousel(event)
        
        elif mtext == '後台網址' or mtext == '公告上傳教學':
            message = [
                TextSendMessage(  # 傳送文字
                    text="您好，請使用新版公告，並請參閱公告教學影片，感謝您"+'\n\n'+'帳號：社區電話'+'\n'+'密碼：27566084'+'\n\n'+'https://www.eiptv-eips.com/Committee/Login'
                ),
                VideoSendMessage(
                    original_content_url="https://www.eiptv-eips.com/%E7%B3%BB%E7%B5%B1%E6%93%8D%E4%BD%9C%E8%AA%AA%E6%98%8E.mp4",
                    preview_image_url="https://www.eiptv-eips.com/%E7%B3%BB%E7%B5%B1%E6%93%8D%E4%BD%9C%E8%AA%AA%E6%98%8E.mp4"
                )
            ]
            line_bot_api.reply_message(event.reply_token, message)
        
        elif mtext == '我要報修':
            message = TextSendMessage(text="❗️請輸入大樓/社區的聯絡電話")
            line_bot_api.reply_message(event.reply_token, message)   
            status[userId] = 's1'
            
        elif mtext == '查詢租金':
            message = TextSendMessage(text="❗️要查詢租金，請先輸入大樓/社區的帳號")
            line_bot_api.reply_message(event.reply_token, message)   
            status[userId] = 's2'
            
        elif mtext == '簡易處理':
            message = [
                TextSendMessage(  # 傳送文字
                    text='您好，請協助將機台重啟看看是否正常運作，機台上方有一黑線，拔起重插即可，謝謝您。'
                ),
                ImageSendMessage(
                    original_content_url="https://i.imgur.com/MW9Kgo4.png",
                    preview_image_url="https://i.imgur.com/MW9Kgo4.png"
                )
            ]
            line_bot_api.reply_message(event.reply_token, message)
            
        # elif mtext == '查詢租金':
        #     message = [
        #         TextSendMessage(  # 傳送文字
        #             text='請提供【查詢月份】，待查詢後立即回覆您，謝謝。'
        #         )
        #     ]
        #     line_bot_api.reply_message(event.reply_token, message)
            
        
            
    elif status.get(userId) =='s1':
                
        if mtext == '是，我要報修' and status.get(userId) =='s1':
            message = [
                TextSendMessage(  # 傳送文字
                    text='請輸入大樓/社區的聯絡電話'
                )
            ]
            line_bot_api.reply_message(event.reply_token, message)
            
        elif mtext == '否，結束報修流程' and status.get(userId) =='s1':
            # 狀態重置
            status[userId]=''
            print("目前狀態是:", status[userId],"已重置狀態" )
            message = [
                TextSendMessage(  # 傳送文字
                    text='流程已經結束，請選擇您需要的服務項目'
                )
            ]
            line_bot_api.reply_message(event.reply_token, message)
       
        # 
        else:
            phone = mtext
            url = f'http://test.eiptv.net:99/api/LineRepair/{(userId)},{(userName)},{(phone)}'
            print("用戶要報修，送給馬丁的網址 是:", url )
            r = requests.get(url)
            soup = str(BeautifulSoup(r.text,"html.parser"))
            lineData = soup
            if 'http' in lineData:
                line_bot_api.reply_message(event.reply_token, TextSendMessage(text="請點選下方的專屬連結進行報修"+"\n\n"+lineData))
                # 狀態重置
                status[userId]=''
            else:
                print("目前狀態是:", status[userId],"進入報修狀態" )
                retryConfirm(event)
                
    elif status.get(userId) == 's2':
         
        if mtext == '是，我要查詢租金':
            message = [
                TextSendMessage(  # 傳送文字
                    text='請輸入大樓/社區的聯絡電話'
                )
            ]
            line_bot_api.reply_message(event.reply_token, message)
            
        elif mtext == '否，結束查詢租金流程':
            # 狀態重置
            status[userId]=''
            print("目前狀態是:", status[userId],"已重置狀態" )
            message = [
                TextSendMessage(  # 傳送文字
                    text='流程已經結束，請選擇您需要的服務項目'
                )
            ]
            line_bot_api.reply_message(event.reply_token, message) 
        
        else:
            phone = mtext
            url = f'http://test.eiptv.net:99/api/LineRepair/{(userId)},{(userName)},{(phone)}'
            print("用戶要查詢租金，送給馬丁的網址 是:", url )
            r = requests.get(url)
            soup = str(BeautifulSoup(r.text,"html.parser"))
            lineData = soup
            if 'http' in lineData:
                line_bot_api.reply_message(event.reply_token, TextSendMessage(text="請點選下方的專屬連結"+"\n\n"+lineData))
                # 狀態重置
                status[userId]=''
            else:
                print("目前狀態是:", status[userId],"進入查詢租金狀態" )
                retryConfirmRent(event)
    
    # 處理完對應的程序後清空狀態            

def sendCarousel(event):  # 轉盤樣板
    try:
        message = TemplateSendMessage(
            alt_text='很抱歉，電腦版的Line 無法顯示此類型選單',
            template=CarouselTemplate(
                columns=[
                    CarouselColumn(
                        thumbnail_image_url='https://i.imgur.com/8ErU1fg.jpg',
                        title='簡易排除設備問題',
                        text='機台呈現黑屏/白屏/粉紅屏/停格（東森自然美廣告）或【機台無更新公告】，請協助操作簡易排除狀況。',
                        actions=[
                            MessageTemplateAction(  # 顯示文字計息
                                label='➡️查看簡易排除操作⬅️',
                                text='簡易處理'
                            )
                        ]
                    ),
                    CarouselColumn(
                        thumbnail_image_url='https://i.imgur.com/z9EqAQI.jpg',
                        title='公告登入問題',
                        text='請確認網址、帳號、密碼是否輸入正確'+'\n'+'帳號：社區電話'+'\n'+'密碼：27566084',
                        actions=[
                            MessageTemplateAction(
                                label='➡️查看後台網址⬅️',
                                text='後台網址'
                            )
                        ]
                    ),
                    CarouselColumn(
                        thumbnail_image_url='https://i.imgur.com/88dNuNF.jpg',
                        title='我要報修',
                        text='已簡易處理或確認後台網址，但還是無恢復正常執行運作；或有其它問題，請點選『我要報修』',
                        actions=[
                            MessageTemplateAction(
                                label='➡️我要報修⬅️',
                                text='我要報修'
                            )
                        ]
                    )
                ]
            )
        )
        line_bot_api.reply_message(event.reply_token, message)
    except:
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text='發生錯誤！'))

# 確認是否要繼續報修
def retryConfirm(event):
    try:
        message = TemplateSendMessage(
            alt_text = '很抱歉，電腦版的Line 無法顯示此類型選單',
            template = ConfirmTemplate(
                text = '無符合貴社區的相關資料，要繼續報修嗎？請點"否"，並聯絡客服電話： 02-2579-1991，由客服總機為您協助報修',
                actions = [
                    MessageTemplateAction(
                        label = '是',
                        text = '是，我要報修'
                    ),
                    MessageTemplateAction(
                        label = '否',
                        text = '否，結束報修流程'
                    )
                ]
            )
        )
        line_bot_api.reply_message(event.reply_token, message)
    except:
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text='發生錯誤！'))

# 確認是否要繼續查詢租金        
def retryConfirmRent(event):
    try:
        message = TemplateSendMessage(
            alt_text = '很抱歉，電腦版的Line 無法顯示此類型選單',
            template = ConfirmTemplate(
                text = '無符合貴社區的相關租金資料，要繼續查詢嗎？請點"否"，並聯絡客服電話： 02-2579-1991，由客服總機為您協助報修',
                actions = [
                    MessageTemplateAction(
                        label = '是',
                        text = '是，我要查詢租金'
                    ),
                    MessageTemplateAction(
                        label = '否',
                        text = '否，結束查詢租金流程'
                    )
                ]
            )
        )
        line_bot_api.reply_message(event.reply_token, message)
    except:
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text='發生錯誤！'))
      
if __name__ == '__main__':
    app.run(port=2000)
