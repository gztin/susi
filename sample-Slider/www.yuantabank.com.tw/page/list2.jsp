<%@page contentType="text/html" pageEncoding="UTF-8" %>
<%@include file="/WEB-INF/views/common/include.jsp" %>

<head>
  <link rel="stylesheet" href="<c:out value=" ${resourcesPath}" />css/inpage.css">
  <script>
    $(function () {
      $("#content2, #content3, #content4, #content5").hide();
      $("a[id^='btn']").on('click', function () {
        var type = $(this).attr('id').substring(3);
        if (type == '1') {
          $("#content2, #content3, #content4, #content5").hide();
          $("#content1").show();
          // show v
          $("#btn1").addClass('on');
          $("#btn1").parent('div').addClass('active');
          // hide v
          $("#btn2, #btn3, #btn4, #btn5").removeClass('on');
          $("#btn2, #btn3, #btn4, #btn5").parent('div').removeClass('active');
        } else if (type == '2') {
          $("#content1, #content3, #content4, #content5").hide();
          $("#content2").show();
          // show v
          $("#btn2").addClass('on');
          $("#btn2").parent('div').addClass('active');
          // hide v
          $("#btn1, #btn3, #btn4, #btn5").removeClass('on');
          $("#btn1, #btn3, #btn4, #btn5").parent('div').removeClass('active');
        } else if (type == '3') {
          $("#content1, #content2, #content4, #content5").hide();
          $("#content3").show();
          // show v
          $("#btn3").addClass('on');
          $("#btn3").parent('div').addClass('active');
          // hide v
          $("#btn1, #btn2, #btn4, #btn5").removeClass('on');
          $("#btn1, #btn2, #btn4, #btn5").parent('div').removeClass('active');
        } else if (type == '4') {
          $("#content1, #content2, #content3, #content5").hide();
          $("#content4").show();
          // show v
          $("#btn4").addClass('on');
          $("#btn4").parent('div').addClass('active');
          // hide v
          $("#btn1, #btn2, #btn3, #btn5").removeClass('on');
          $("#btn1, #btn2, #btn3, #btn5").parent('div').removeClass('active');
        } else {
          $("#content1, #content2, #content3, #content4").hide();
          $("#content5").show();
          // show v
          $("#btn5").addClass('on');
          $("#btn5").parent('div').addClass('active');
          // hide v
          $("#btn1, #btn2, #btn3, #btn4").removeClass('on');
          $("#btn1, #btn2, #btn3, #btn4").parent('div').removeClass('active');
        }
        return false;
      });
    });
  </script>
  <style>
    #content1 img,
    #content2 img,
    #content3 img,
    #content4 img,
    #content5 img {
      margin: auto;
    }

    .custom-ul li {
      position: relative;
      padding-left: 10px;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .custom-ul li:before {
      content: "";
      position: absolute;
      left: 0;
      top: 9px;
      width: 3px;
      height: 3px;
      background: #000;
      border-radius: 50%
    }

    .article-content p {
      margin: 0 0 18px;
      text-align: left;
    }

    .article-content img {
      display: block;
      max-width: 100%;
      margin: 0 auto 18px;
    }

    .article-content .square {
      padding-left: 20px;
      margin: 20px 0 24px;
    }

    .article-content .square li {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .content-note {
      margin: 20px 0;
    }

    .article-content .list-title {
      display: block;
      margin-bottom: 4px;
      font-weight: bold;
    }
    
    #content1 > p,
    #content2 > p,
    #content3 > p,
    #content4 > p{
       padding:20px 0 24px; 
    }
    #content5 > p:nth-child(1){
    	padding-top:20px;
    }
    #content5 >img{
    	padding-bottom:20px;
    }
    tbody >tr > td:nth-child(2){
    	text-align:left;
    }
     td > p{
        margin: 0px!important;
    }
  </style>
</head>

<body>
  <%-- 形象圖 --%>
    <%@include file="/WEB-INF/views/common/insideBanner.jsp" %>

      <div class="main_block">
        <%@include file="/WEB-INF/views/common/menu/companyMenu.jsp" %>
          <div class="main_box">
            <%-- 麵包屑--%>
              <ul class="breadcrumb">
                <li><a href="<c:out value=" ${contextPath}" />companyProfile/list.do">關於元大</a></li>
                <li><a href="<c:out value=" ${contextPath }" />environmentalSustainability/list.do">永續發展專區</a></li>
                <li>金融商品創新與服務</li>
              </ul>
              <%-- 內容總覽--%>
                <div class="inner_box">
                  <h5 class="tit"><span>金融商品創新與服務</span></h5>
                  <div>
                    <div class="picBox"><img src="${resourcesPath}images/environmentalSustainability32.jpg"
                        alt="" /><a href="${resourcesPath}images/environmentalSustainability32.jpg"></a></div>
                    <div>
                      本行深耕創新科技應用，落實數位服務管道的資安維護與風險預防，確保交易穩定並建構完善的客戶權益保障機制。為落實永續經營與數位轉型，結合大數據與AI技術發展「數位低碳服務流程」，串聯多元生活場景打造零時差金融生態圈。同時，於內部推動流程自動化以降低人工風險與資源耗損，在追求作業效率與環境友善的過程中，提供更優質的客戶體驗。
                    </div>
                    <p class="content-note">*手機版閱覽時可向右滑動*</p>
                    <div class="card_tab">
                      <div class="thumbs-cotnainer_2">
                        <div class="swiper-wrapper">
                          <div class="swiper-slide active">數位平台服務<a href="#" class="on" id="btn1"></a></div>
                          <div class="swiper-slide">智慧申辦理財<a href="#" id="btn2"></a></div>
                          <div class="swiper-slide">數位金流服務<a href="#" id="btn3"></a></div>
                          <div class="swiper-slide">新興科技應用<a href="#" id="btn4"></a></div>
                          <div class="swiper-slide">執行成果<a href="#" id="btn5"></a></div>
                        </div>
                      </div>
                    </div>
                    <div class="article-content">
                    <div id="content1">
                      <img src="${resourcesPath}images/environmentalSustainability33.jpg">

                      <ul class="square">
                        <li>
                          提供全天候24小時「一機在手、行動隨我」、讓客戶可隨時掌握即時金融交易及金融理財服務(各項服務實際交易時間將公告於本行官網)。
                        </li>
                        <li>
                          延伸行動支付應用範圍至購物、餐飲、交通及住宿等用戶基本生活場景，未來將規劃開發醫療、保險、電信與智慧服務等市場的繳費服務，擴大應用場景。
                        </li>
                      </ul>
                      <img src="${resourcesPath}images/environmentalSustainability34.jpg">
                      <ul class="square">
                        <li>
                          提供臺 /外幣、理財、保險、貸款、信用卡、 黃金存摺、生活繳費及各項通知服務，為客戶提供24小時全年無休的數位體驗(各項服務實際交易時間將公告於本行官網)。
                        </li>
                        <li>
                          將消費者生活中所需如申辦相關銀行業務、理財及轉帳繳費...等金融服務，透過網路賦予交易即時性、便利性。透過數位化服務，以用戶需求為核心，持續精進、深耕更多場景應用，拓展生態圈夥伴關係，以完整化場域生態發展與數位體驗創新，提供客戶更便利、安心的網路銀行服務。
                        </li>
                      </ul>
                      <img src="${resourcesPath}images/environmentalSustainability35.jpg">
                      <ul class="square">
                        <li>
                          提供全方位的企業金流管理服務，大幅減少企業客戶財務營運成本，最適化資金調度效率需求，採用高規格FXML安控憑證，建立安全、高效率的數位交易平台。
                        </li>
                        <li>
                          接軌國際發展雙語數位化，提供中英文版功能介面，讓客戶體驗「線上服務無國界、網路交易零距離」，提供安全、便捷的商務網路服務，優化營運流程並降低人力成本，透過數位轉型的力量，加速實現企業永續經營的目標。
                        </li>
                      </ul>
                    </div>
                    <div id="content2">
                      <img src="${resourcesPath}images/environmentalSustainability36.jpg">
                      <ul class="square">
                        <li>
                          一站式線上申辦服務，數位存款帳戶攜手與元大證券、元大投信合作，提供「銀行、證券帳戶雙開戶」、「銀行、投信帳戶雙開戶」服務，可一次滿足各類帳戶開立需求，享有免出門、免重複填表申請、免重複上傳證件，大幅縮短個別開戶的時間及程序。
                        </li>
                        <li>
                          舉凡信用卡、個人房屋貸款、信用貸款及汽車貸款皆可透過線上申辦，藉由串接數位發展部MyData平臺，客戶於線上申辦臺、外幣數位存款帳戶或其他業務時，由前端完成指定證件上傳並掃描完成後，透過證件辨識功能(Optical Character Recognition, OCR)單次授權，將證件上之個人資訊帶入相對應欄位，減少客戶填寫欄位並縮短整體申辦時間。
                        </li>
                      </ul>
                      <img src="${resourcesPath}images/environmentalSustainability37.jpg">
                      <ul class="square">
                        <li>
                          布建「數位理財生態圈」，客戶能自行透過手機完成相關投資理財服務，包含：換匯服務、國內外基金、海外債券及ETF之交易等，並搭配基金百元投資、日日扣方案等多元化理財方式，讓投資人依據自身風險承受能力調配投資方式與標的，頗受客戶好評與愛用。
                        </li>
                        <li>
                          持續擴充數位通路產品服務，提供全新境外股票/ETF交易功能，讓過往只能臨櫃辦理交易之客戶，不再受限時間及地點，可以隨時隨地進行美股線上交易及港滬股線上賣出(各項服務實際交易時間將公告於本行網站)，完善數位理財生態圈。
                        </li>
                      </ul>
                      <img src="${resourcesPath}images/environmentalSustainability38.jpg">
                      <p class="list-title" style="padding-bottom: 0px;">外幣投資理財3大特色亮點：</p>
                      <ul class="square">
                        <li>
                          提供13種外幣的線上換匯優惠，換匯服務零時差。
                        </li>
                        <li>
                          提供「定期定額換匯」、「留單換匯」、「外幣到價通知」，即時追蹤全球外匯市場的變化及波動機會，可供客戶分散匯兌風險。
                        </li>
                        <li>
                          便利的換匯服務與多元的外幣投資商品，靈活運用可讓「匯差」、「利差」帶來雙重投資收益。
                        </li>
                      </ul>
                    </div>
                    <div id="content3">
                      <img src="${resourcesPath}images/environmentalSustainability39.jpg">
                      <p>
                        提供「約定連結存款帳戶付款(Account Link)」服務及八大行動支付帳戶綁定連結服務，存款客戶可申請綁定電子支付業務帳戶連結扣款，另外也開放行動銀行導入台灣Pay、全盈+PAY(安卓版手機) QR Code掃碼支付服務，出示收付款QR Code或掃碼就可進行轉帳、消費及繳納各類費用及稅金，將行動支付應用範圍擴及購物、餐飲、交通及住宿等服務。
                      </p>
                      <img src="${resourcesPath}images/environmentalSustainability40.jpg">
                      <p>
                        打造高彈性、可配合各校需求調整功能的代收平台，擴大服務至無信用卡客群需求(如：學生)，串接全方位的金流，陸續開通包含超商、信用卡、銀聯卡/支付寶、i繳費以及郵局等通路，達到普惠金融效益，並提供便利學雜費代收服務平台，同時開放行政規費收取，不須額外下載APP或綁定特定錢包，即可使用多種支付工具付款，解決學生現金繳納收付風險。
                      </p>
                      <img src="${resourcesPath}images/environmentalSustainability41.jpg">
                      <p>
                        透過分行通路在地深耕推廣，將服務推廣至離島金門等地區，提供專案優惠，鼓勵當地商家踴躍加入數位行動支付行列，也讓大量使用現金收付的偏鄉店家或夜市攤商可透過便利的電子化支付工具收付款，簡化收款機制，兼顧降低服務收付接觸風險、現金交易風險並完善管理流程。
                      </p>
                    </div>
                    <div id="content4">
                      <img src="${resourcesPath}images/environmentalSustainability42.jpg">
                      <p>
                        本行與元大金控集團旗下子公司元大證券、元大人壽、元大期貨、元大投信，依照國際FIDO聯盟驗證標準所規劃的身分驗證服務，透過元大銀行e櫃檯註冊及使用元大晶片金融卡與讀卡機進行認證所產製的QR code，並搭配元大Fast-ID APP進行身分驗證與授權，在元大集團內達成以下場景應用：
                      </p>
                      <ul class="square">
                        <li>
                          <span class="list-title">集團資產總覽</span>
                          客戶可分別在「元大行動銀行APP、元大證券投資先生APP、元大人壽iCare APP、元大基金先生APP」上，一次查看於「銀行、證券、人壽、期貨、投信」的資產明細。
                        </li>
                        <li>
                          <span class="list-title">線上開戶/會員註冊 資料自動帶入</span>
                          開立元大「證券戶、期貨戶、投信戶」或是註冊元大人壽網路會員時，將可自動帶入客戶留存於元大銀行的基本資料，減省重複填打的時間。
                        </li>
                      </ul>
                      <img src="${resourcesPath}images/environmentalSustainability43.jpg">
                      <ul class="square">
                        <li>
                          提供客戶24小時多元且即時的服務管道，透過本行智能客服系統服務，即時進行業務詢問、解決問題，提升客戶服務體驗。
                        </li>
                        <li>
                          為便利高齡長者/視覺不便者閱讀操作，本行智能客服提供友善字體放大功能，並針對高齡長者、身心障礙者較關心之照護問題，設計安養信託/身心障礙者信託問答及線上申請服務。
                        </li>
                        <li>
                          因應高齡化社會趨勢，本行智能客服貼心提供「高齡化保險商品專區」資訊服務。
                        </li>
                        <li>
                          真人文字客服，提供即時諮詢服務，營造友善金融環境。本行結合真人文字客服與ATM自動化櫃員機服務，打造更便捷、貼近人性的金融友善場景，為不同族群提供貼心服務，如聽障同胞只需使用手機掃描ATM顯示屏中的「真人友善服務」QR Code，即可透過真人文字客服功能進行即時溝通，滿足當下的金融需求。同時，ATM自動化櫃員機顯示屏觸碰式功能，也為輪椅族群量身打造合宜服務高度，元大銀行以創新科技升級智能客服，致力打造更貼心、專業的友善金融服務體驗，期望能夠滿足客戶多元的金融服務需求。
                        </li>
                      </ul>
                      <img src="${resourcesPath}images/environmentalSustainability44.jpg">
                      <p>
                        因應金融數位化轉型，金融從業人員於中後台之作業流程品質需持續優化，以快速回應用戶需求和使用體驗。本行導入機器人流程自動化(RPA，Robotic Process Automation)技術，協助提升作業處理效率及降低人工作業錯誤率。
                      </p>
                    </div>
                    <div id="content5">
                      <p>
                        在全球2050年淨零排放的目標下，ESG永續發展的理念，已逐漸深植企業的管理思維，永續發展及淨零排放已是全球及我國政策之核心目標，面對此一發展趨勢，本行以創新商業模式或金融科技應用於推動永續相關活動之重點成果如下：
                      </p>
                      <img src="${resourcesPath}images/environmentalSustainabilityC501.jpg">
                      <p>
                        推出「鑽金碳吉」碳帳戶，鼓勵更多用戶加入金融減碳行動，客戶於行動銀行APP進行轉帳換匯、投資理財、生活繳費稅、線上申請、電子對帳單等線上金融服務時，可累計減碳克數，將電子交易轉化為實質減碳效益，客戶只需從元大行動銀行APP點選「我的碳吉帳戶」，即可查看個人減碳成果，記錄數位金融服務減碳成效，以低碳商業模式，鼓勵更多用戶共同加入金融減碳行動。統計2025年「鑽金碳吉帳戶」全年度節約5億張A4紙，堆疊高度約1,393座台北101大樓，若與前一年度相較，提升約18%。
                      </p>
                      <p>
                        因應行動支付服務蓬勃發展，本行「行動掃碼支付服務」，於2023年11月通過英國標準協會(BSI) ISO 14067產品碳足跡標準驗證，成為首家以「行動掃碼支付服務」，完成自願性碳足跡盤查的金融機構，更於2024年2月進階取得環境部核發碳標籤。碳帳戶目前已完成八大電子支付業者串接，拓展延伸金融場景服務，更瞄準國際發展趨勢，跨國參與日本、韓國等國家消費支付服務，現在只要打開「元大行動銀行APP」，點選掃碼支付功能，輕鬆切換消費國別，即可在當地標示「TWQR」的商店以行動掃碼支付完成消費購物，持續多角化深耕數位金融永續領域。
                      </p>
                      <p>
                        為擴大企業夥伴合作，深化行動支付場景應用，在滿足民眾對智慧生活需求的同時，兼顧消費者的使用體驗，2022年~2025年舉辦「減碳夏令營」、「減碳卡好康」、「FunBike單車自由行」、「碳吉減碳做公益  一卡通綠點送給你」活動，使客戶享受便利的數位通路服務，獲得實質性的回饋體驗，讓客戶減碳更有感，實現環保、低碳、健康、樂活等永續目標。
                      </p>
                      <img src="${resourcesPath}images/environmentalSustainabilityC502.jpg">
                      <p>
                        近年隨著聊天機器人技術趨於成熟，也將金融科技服務帶向新的里程碑。因應數位轉型浪潮，本行提供「元先生」智能客服，透過最新的諮詢腦(FAQ)、查詢腦(NLU)的雙腦人工智慧，將輸入的語句進行多意圖識別，搭配金融服務流程模組，精準提供客戶所需要的答案。
                      </p>
                      <p>
                        科技始自於人性，「元先生」智能客服有著24小時服務的優勢，本行在智能客服系統程式開發過程中，將金融友善服務優先融入設計理念，為利視覺不便者閱讀操作，貼心提供友善字體放大功能，並針對身心障礙者較關心之照護問題，提供安養信託/身心障礙者信託問答及線上申請服務，貼近高齡及視障客戶的需求。
                      </p>
                      <p>
                        為提供友善金融服務，「元先生」提供「真人文字客服」服務，使聽障客戶可透過打字的方式與線上客服人員進行溝通，打造更便捷、貼近人性的金融友善場景。聽障同胞只需使用手機掃描ATM顯示屏中的「真人友善服務」QR Code，即可透過真人文字客服功能進行即時溝通，滿足當下的金融需求。同時，ATM顯示屏觸碰式功能，也為輪椅族群量身設計合宜服務高度。
                      </p>
                      <img src="${resourcesPath}images/environmentalSustainabilityC503.jpg">
                      <p>
                        為實踐永續發展目標，本行推動「行動保險服務」，持續導入新興科技應用，2023年開辦「遠距投保業務」，結合eKYC身分識別技術，提供客戶「零紙本、零接觸」的投保服務體驗，2024年將「行動保險服務」升級，開辦「行動保全服務」，業務人員除了可透過iPad協助客戶完成投保外，亦可辦理保險契約內容變更，將傳統以紙本作業的申辦流程數位化，提供客戶便利且更具效率的投保體驗，2025年本行「行動保險服務」更攜手凱基人壽，以提供客戶更齊全的保險商品服務。
                      </p>
                      <p>
                        「行動保險服務」可以有效減少紙張使用、降低交通運輸產生碳排放及能源消耗使用，且因具備更便捷的流程、更迅速的審核效率及行動裝置得自由縮放螢幕的特性，使年長、視覺不便者也能輕鬆地閱覽表單，有效提升客戶申辦體驗與社會大眾接觸數位保險的頻率，充分落實金融友善並推進金融科技的發展。電子化傳輸相較傳統紙本文件遞送，更能提高客戶的個人資料安全和隱私保護。統計2025年「行動保險服務」全年度節省約32.2萬張A4紙，減少約2.44噸的碳排放量。
                      </p>
                      <p>
                        隨著金融數位轉型，理專可透過iPad行動裝置上的M化業務工具「行動理專」系統，向客戶展現最即時的存款、放款餘額，及投資資產部位；並透過與客戶面對面互動理財諮詢，結合最新市場展望，協助客戶進行資產配置調整，立即下單。元大銀行透過導入金融科技於業務執行，達到即時、節省時間及節能減碳（無紙化），並協助客戶掌握投資契機，滿足客戶的理財需求服務。統計2025年「行動理專服務」全年度節省約14.8 萬張A4 紙，減少約1.06 噸的碳排量。
                      </p>
                      <p>
                        本行持續致力於環境永續議題，於業務執行中透過金融科技導入，達到節能減碳效果；於銷售ESG相關影響力投資基金、主題投資基金、最佳篩選基金、整合投資分析基金，2025年庫存為折合新臺幣34.08億元，佔本行2025年底總資產規模2.33%。
                      </p>
                      <img src="${resourcesPath}images/environmentalSustainabilityC504.jpg">
                      <p>
                        本行透過導入台灣智慧財產管理規範(TIPS)，做為全面推動數位創新金融服務基礎，橫向整合部門研發動能，提升創新實力，並縱向成立智財管理小組，帶動全行金融永續經營韌性。透過智慧財產管理制度之建置，持續精進管理制度流程，進行全體員工之教育訓練，提升同仁對於智財保護觀念，並落實於公司之文件管理機制，因應創新提案與專利數量增加，建置由高階主管組成之智慧財產管理小組，使智財的管理與運用更有效率，亦透過定期召開會議，讓智財的發展應用與公司經營策略緊密連結，更將智財風險評估流程數位化，結合資訊研發系統，使研發過程兼顧風險管理機制，以數位管理促進企業智財永續經營，避免侵權爭議及增加防禦實力。本行智財管理制度通過由經濟部產業發展署主辦、資策會科技法律研究所推行之TIPS(A級)驗證。
                      </p>
                      <img src="${resourcesPath}images/environmentalSustainabilityC505.jpg">
                      <p>
                        本行為「金融區塊鏈有價證券借貸銀行保證服務」先導銀行，透過數位化轉型推動無紙化作業，線上一鍵審核機制及區塊鏈加密特性，不僅提高作業效率，更讓交易資訊更受到安全保障。
                      </p>
                      <p>
                        導入ESG評等ｅ-Loan，透過系統自動化輔助評核企業ESG三支柱表現績效，提供企業產業比較並進行議合，加速企業朝永續發展邁進。
                      </p>
                      <p>
                        推動責任授信，透過評析本行遵循金控「永續金融準則」下產業結構，並結合範疇三資產碳盤查與「永續經濟活動認定參考指引」產業經濟活動指標，推動建築業綠色融資專案，深化建築業者加速推動綠建築、能效建築，以建構低碳城市。
                      </p>
                      <p>
                        為響應政府政策，善盡企業公民責任，持續推動臺灣企業永續發展，本行建置「新法金徵審系統」，將ESG應用服務整合至銀行辦理授信業務之徵審系統中，透過系統自動化輔助ESG授信作業，藉由議合加速企業朝永續發展邁進，2025年本行累計承作綠色融資案件總計78件、永續連結貸款案件總計75件。另在本行「新法金徵審系統」中，設有「授信戶屬ESG高風險產業之環境社會(E&S)風險評估表」、「ESG徵信報告」、「ESG績效指標」及「ESG自評問卷」等項目，輔助ESG相關議題檢視暨填報作業，提升工作效率，落實永續金融發展目標。
                      </p>
                      <img src="${resourcesPath}images/environmentalSustainabilityC507.jpg">
                      <p>
                        為實踐永續責任投資，調整傳統投資配置邏輯，持續投資永續發展債券及永續連結商業本票，透過將資金導向具環境與社會價值之資產配置模式，推動永續投資；並透過發行永續債券，遵循用途導向之資金籌集模式，將募集資金專款用於再生能源及節能減碳等綠色專案，強化資金用途與永續目標之連結，提升對永續金融商品之參與度。
                      </p>
                      <p>
                        持續優化「交易核決管理系統」與「SBS股權交易系統」，更針對衍生性金融商品開發「法人ＴＭＵ額度申請平台」。透過推動投資服務數位化與無紙化作業，有效落實節能減碳，落實環境友善，提升投資服務效率，展現對普惠金融與責任投資的承諾。
                      </p>                   
                      <img src="${resourcesPath}images/environmentalSustainabilityC508.jpg">
                      <p>
                        信用卡、個人房屋貸款、信用貸款及汽車貸款皆可透過線上申辦，藉由客戶授權本行查詢聯徵中心所得資料作為財力證明文件，有效減少客戶申辦時間，提升申貸便利性，加速審核流程，節約紙張用度，以達節能減碳成效。
                      </p>
                      <p>
                        為提升元大證券客戶於本行E櫃檯申辦信貸之便利性，經身分驗證後，以電子方式同意並授權以其於元大證券資產庫存餘額作為財力證明文件，除減省申辦貸款須另提供貸款所需財力證明資料，縮短申辦時間，提升申貸便利性，更可減少紙張使用以達減碳目的。
                      </p>                      
                      <img src="${resourcesPath}images/environmentalSustainabilityC509.jpg">
                      <p>
                        主管機關為鼓勵金融創新，於113年底發布「金融業申請業務試辦作業要點」，大幅放寬金融業者可進行業務試辦的範圍，帶動114年度金融試辦案量創高。本行攜手財金公司與中信銀行，合作「數位身分認證及授權」業務試辦案，推出「ATM跨行身分驗證」服務，客戶可透過中信銀行於全台各通路設置之ATM，以晶片金融卡完成跨行身分核驗，進而申請無卡提款及重設網路銀行，擴大數位服務應用模式。透過新興科技應用與同業攜手，拓展數位通路服務，提升金融服務可及性。
                      </p>
                      <p>
                        因應線上申辦流程優化，以及客戶對於快速身分驗證的需求，本行參與「金融Fast-ID驗轉中心」業務試辦案，客戶於本行辦理線上業務時，可授權使用他行Fast-ID進行「跨行身分驗證」，將他行資料快速導入本行系統，無需使用讀卡機，可大幅提升客戶申辦效率與流暢體驗，促進無紙化金融服務，強化身分驗證機制，提升金融交易安全。
                      </p>               
                      <img src="${resourcesPath}images/environmentalSustainabilityC506.jpg">
                      <p>
                        本行長期致力於客戶經營、產品創新與推動金融永續，獲得國內外各專業機構之<a href="<c:out value='${resourcesPath}' />pdf/2025AwardsHonors.pdf" target="_blank">獎項殊榮</a>。
                      </p>
                      <div>
                      	<table class="hoverType rate_interest" width="100%" cellpadding="0" cellspacing="0">
            <tbody><tr>
              <th>頒獎機構</th>
              <th>獎項</th>
              
            </tr>
            
	            <tr>
	              <td>金融監督管理委員會 </td>
	              <td>
                    <p>114 年度第三屆永續金融評鑑前25%銀行</p>
                    <p>114 年度公平待客原則評核前25%銀行 </p>
                    </td>
	            </tr>
            
	            <tr>
	              <td>台灣證券交易所</td>
	              <td>機構投資人盡職治理資訊揭露較佳名單</td>
	             
	            </tr>
                <tr>
                    <td>財經資訊服務有限公司</td>
                    <td>
                        <p>跨行服務創新獎 </p>
                        <p>共創典範獎 </p>
                        <p>阻詐聯防貢獻獎-佳作獎</p>
                  </td>
                  </tr>
                  <tr>
                    <td>財團法人金融聯合徵信中心</td>
                    <td>第十九屆金質獎－授信資料類績優機構</td>
                   
                  </tr>
                  <tr>
                    <td>台灣永續能源研究基金會</td>
                    <td>
                        <p>TSAA 台灣永續行動獎：最佳行動方案</p>
                        <p>社會共融領袖獎</p>
                        <p>台灣企業永續獎-資訊安全領袖獎 </p>
                    </td>
                  </tr>
                  <tr>
                    <td>中華民國國家企業競爭力發展協會</td>
                    <td>
                        <p>國家品牌玉山獎-最佳產品類 </p>
                        <p>國家品牌玉山獎-最佳人氣品牌類</p>
                    </td>
                  </tr>
                  <tr>
                    <td>財資雜誌</td>
                    <td>
                        <p>Triple A Digital Awards :  </p>
                        <p>台灣最佳金融安全專案首獎-天網AI阻詐模型</p>
                        <p>Triple A Private Capital Awards : </p>
                        <p>最佳財富管理機構體驗獎</p>
                    </td>
                  </tr>
                  <tr>
                    <td>財資雜誌</td>
                    <td>
                        <p>財富管理大獎：最佳理專團隊、最佳財富增值、金融服務創新</p>
                    </td>
                  </tr>
                  <tr>
                    <td>遠見雜誌 </td>
                    <td>
                        <p>第21 屆《遠見》ESG企業永續獎 社會創新組</p>
                        <p>績優獎：天網AI阻詐模型 </p>
                    </td>
                  </tr>
                  <tr>
                    <td>Brands and Business Magazine Awards</td>
                    <td>
                        <p>台灣最佳數據賦能</p>
                        <p>台灣最佳數位銀行</p>
                        <p>台灣最佳鑽金支付生態圈</p>
                    </td>
                  </tr>
                  <tr>
                    <td>Global Business Magazine Award</td>
                    <td>
                        <p>2025 台灣最佳綠色銀行</p>
                    </td>
                  </tr>
                  <tr>
                    <td>World Economic Magazine Award</td>
                    <td>
                        <p>2025 台灣最佳綠色數位銀行</p>
                    </td>
                  </tr>
	            </tbody>
	            </table>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
          </div>
          <div class="bt_warnings"></div>
      </div>
</body>
