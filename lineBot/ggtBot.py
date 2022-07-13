from linebot.models import MessageEvent, TextMessage, TextSendMessage, ImageSendMessage, StickerSendMessage, LocationSendMessage, QuickReply, QuickReplyButton, MessageAction
from linebot.models import MessageEvent, TextMessage, PostbackEvent, TextSendMessage, TemplateSendMessage, ConfirmTemplate, MessageTemplateAction, ButtonsTemplate, PostbackTemplateAction, URITemplateAction, CarouselTemplate, CarouselColumn, ImageCarouselTemplate, ImageCarouselColumn
from linebot.exceptions import InvalidSignatureError
from linebot import LineBotApi, WebhookHandler
from flask import request, abort
from flask import Flask
import requests
from bs4 import BeautifulSoup
import random

app = Flask(__name__)

line_bot_api = LineBotApi(
    'W4rZuPsIe7y1kPsOV+1d+oidB9R7uDuLlGxYELp1ScAOZXFihE7aAVOE9oSc8B0H14el+d/L+ev1Qv9GS8UhAZ06qcNvG/07FVMZ91AAiazxQnBdFpG5rd9nJ62knD2lI/Fs5NmSIAVNBk52rIt0hQdB04t89/1O/w1cDnyilFU=')
handler = WebhookHandler('c90ce7e0b40bea4fd79c5ddda2621a46')


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
    if mtext == '寶早安':
        sendCarousel(event)

    elif mtext == '@看八卦':
        try:
            content = []

            web = requests.get(
                'https://www.ptt.cc/bbs/Gossiping/index.html', cookies={'over18': '1'})
            soup = BeautifulSoup(web.text, "html.parser")
            # 取得 class 為 title 的 div 內容
            titles = soup.find_all('div', class_='title')
            for i in titles[0:10]:
                title = i.text.strip()
                link = 'https://www.ptt.cc/' + i.find('a')['href']
                content += [title + link]
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='\n\n'.join(content)))
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '@看表特':
        try:
            artTitle = []
            artLink = []
            content = []

            web = requests.get(
                'https://www.ptt.cc/bbs/Beauty/index.html', cookies={'over18': '1'})
            soup = BeautifulSoup(web.text, "html.parser")
            # 取得 class 為 title 的 div 內容
            titles = soup.find_all('div', class_='title')
            for i in titles[0:10]:
                title = i.text.strip()
                link = 'https://www.ptt.cc/' + i.find('a')['href']
                content += [title + link]
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='\n\n'.join(content)))
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '@看國際新聞':
        try:
            content = []

            url = 'https://news.ltn.com.tw/list/breakingnews/world'
            web = requests.get(url)
            soup = BeautifulSoup(web.text, "html.parser")
            news = soup.select('div.whitecon > ul > li')
            for i in news[0:10]:
                title = i.find('a')['title']
                link = i.find('a')['href']
                content += [title + link]
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='\n\n'.join(content)))
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '@看熱門新聞':
        try:
            content = []

            url = 'https://news.ltn.com.tw/list/breakingnews/popular'
            web = requests.get(url)
            soup = BeautifulSoup(web.text, "html.parser")
            news = soup.select('div.whitecon > ul > li')
            for i in news[0:10]:
                title = i.find('a')['title']
                link = i.find('a')['href']
                content += [title + link]
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='\n\n'.join(content)))
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '@找美食':
        try:
            content = []

            web = requests.get(
                'https://www.ptt.cc/bbs/Food/index.html', cookies={'over18': '1'})
            soup = BeautifulSoup(web.text, "html.parser")
            # 取得 class 為 title 的 div 內容
            titles = soup.find_all('div', class_='title')
            for i in titles[0:10]:
                title = i.text.strip()
                link = 'https://www.ptt.cc/' + i.find('a')['href']
                content += [title + link]
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='\n\n'.join(content)))
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

    elif mtext == '@看今日運勢':
        try:
            # fate = ['凶', '大凶', '平', '末吉', '小吉', '中吉', '大吉', ]
            # result = random.choice(fate)
            result = random.choice(range(1, 100))
            resultNumber = result
            fateNumber = str(resultNumber)
            poemNumber = "抽到籤號:"+fateNumber

            urlBook = f"https://opensheet.elk.sh/1-iH-YGEgyEkjrV2bM_sWR2MytqcfJf0ySiCugaiAgJw/fateData"
            headers = {
                "user-agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36"
            }
            r_book = requests.get(urlBook, headers=headers)
            data_store = r_book.json()
            poem = data_store[result]

            r1 = poem["poemType"]
            r2 = poem["poemContent"]
            r3 = poem["poemNote"]

            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text=poemNumber+'\n\n'+r1+'\n\n'+r2+'\n\n'+r3))
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

    elif mtext == '@傳送圖片':
        try:
            # 接受 1MB 以下的 JPG 圖檔，網址必須是 https 開頭
            message = ImageSendMessage(
                original_content_url="https://i.imgur.com/4QfKuz1.png",
                preview_image_url="https://i.imgur.com/4QfKuz1.png"
            )
            line_bot_api.reply_message(event.reply_token, message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))

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

    if mtext == '@快速選單':
        try:
            message = TextSendMessage(
                text='請選擇最喜歡的程式語言',
                quick_reply=QuickReply(
                    items=[
                        QuickReplyButton(
                            action=MessageAction(label="Python", text="Python")
                        ),
                        QuickReplyButton(
                            action=MessageAction(label="Java", text="Java")
                        ),
                        QuickReplyButton(
                            action=MessageAction(label="C#", text="C#")
                        ),
                        QuickReplyButton(
                            action=MessageAction(label="Basic", text="Basic")
                        ),
                    ]
                )
            )
            line_bot_api.reply_message(event.reply_token, message)
        except:
            line_bot_api.reply_message(
                event.reply_token, TextSendMessage(text='發生錯誤！'))


def sendCarousel(event):  # 轉盤樣板
    try:
        message = TemplateSendMessage(
            alt_text='轉盤樣板',
            template=CarouselTemplate(
                columns=[
                    CarouselColumn(
                        thumbnail_image_url='https://photo.sofun.tw/2017/04/Mo-PTT-Logo.png',
                        title='批踢踢',
                        text='請選擇看板',
                        actions=[
                            MessageTemplateAction(  # 顯示文字計息
                                label='八卦版',
                                text='@看八卦'
                            ),
                            MessageTemplateAction(  # 顯示文字計息
                                label='表特版',
                                text='@看表特'
                            ),
                            MessageTemplateAction(  # 顯示文字計息
                                label='找美食',
                                text='@找美食'
                            )
                        ]
                    ),
                    CarouselColumn(
                        thumbnail_image_url='https://play-lh.googleusercontent.com/t_bdeVM08aeIAjzWF70-H3oOv4yEQSskm-d0K1SXlvTHQx-AHfaTaS5OIIRvvXguo1E',
                        title='看新聞',
                        text='選擇新聞類型',
                        actions=[
                            MessageTemplateAction(
                                label='國際新聞',
                                text='@看國際新聞'
                            ),
                            MessageTemplateAction(
                                label='熱門新聞',
                                text='@看熱門新聞'
                            ),
                            MessageTemplateAction(
                                label='今日運勢',
                                text='@看今日運勢'
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


def sendButton(event):
    try:
        message = TemplateSendMessage(
            alt_text='按鈕樣板',
            template=ButtonsTemplate(
                thumbnail_image_url='https://photo.sofun.tw/2017/04/Mo-PTT-Logo.png',  # 顯示的圖片
                title='批踢踢',  # 主標題
                text='請選擇：',  # 副標題
                actions=[
                    MessageTemplateAction(  # 顯示文字計息
                        label='八卦版',
                        text='@看八卦'
                    ),
                    MessageTemplateAction(  # 顯示文字計息
                        label='表特版',
                        text='@看表特'
                    ),
                    MessageTemplateAction(  # 顯示文字計息
                        label='找美食',
                        text='@找美食'
                    )
                ]
            )
        )
        line_bot_api.reply_message(event.reply_token, message)
    except:
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text='發生錯誤！'))


def sendButton2(event):
    try:
        message = TemplateSendMessage(
            alt_text='按鈕樣板',
            template=ButtonsTemplate(
                thumbnail_image_url='https://media3.s-nbcnews.com/i/newscms/2018_21/2442281/og-nbcnews1200x630_c986de7e1bb6ad2281723b692aa61990.png',  # 顯示的圖片
                title='看新聞',
                text='請選擇：',
                actions=[
                    MessageTemplateAction(
                        label='國際新聞',
                        text='@看國際新聞'
                    ),
                    MessageTemplateAction(
                        label='國內新聞',
                        text='@看國內新聞'
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
