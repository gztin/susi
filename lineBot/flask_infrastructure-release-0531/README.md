# flask_infrastructure

1.安裝poetry
pip install poetry
2.用poetry安裝flask專案相關套件
poetry install
3.選取vscode的環境
在vscode按F1 輸入 Python: Select Interpreter 
->
選最後面是poetry結尾的
->
關掉vscode在打開
4.啟動服務
python -m flask run

5.打開cmd 看看api通了沒
curl --location --request GET 'http://localhost:5000/api/v1/linebot/message'