// ==UserScript==
// @name         巴哈姆特之刪除動畫瘋中獎信件
// @description  一鍵刪除惱人的中獎信件，本腳本雖經過測試，但無法保證不會誤刪，請理解風險後再使用
// @namespace    nathan60107
// @version      1.3
// @author       nathan60107(貝果)
// @homepage     https://home.gamer.com.tw/homeindex.php?owner=nathan60107
// @match        https://mailbox.gamer.com.tw/?l=1
// @match        https://mailbox.gamer.com.tw
// @grant        none
// ==/UserScript==

var myMailBox = Array(), myDate = Array();//暫存信件編號與日期的變數

function isAniBabi(mail){//檢查是否是巴幣中獎信
    return null!=mail.match(/恭喜您於[\d\/]+答對了動畫瘋的問答遊戲！\n本次獎勵：[\d]+ 巴幣\n目前已完成巴幣的發送！\n\n--\n本信件為系統通知信件，請勿回覆！/);
}

function strip(html){//去除html成份 只留下純文字
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent||tmp.innerText;
}

function myReload(){
    location.reload();
}

function changeButtonText(text, isActive, func){//改變按鈕文字與屬性
    jQuery(".delAniBabi").html("\n\t<a class=\"not-active\">"+text+"</a>\n\t");
    jQuery(".delAniBabi")[0].childNodes[1].attributes[0].nodeValue = isActive ? "is-active" : "not-active";
    if(isActive){
        jQuery(".delAniBabi").click(func)
    }
}

function delMail(mailSn, date, mailContent, mailNumber){//刪除指定信件並通知
    var t = jQuery, i = window.mailbox, e = mailSn;

    t.post("/ajax/" + i.boxType + "Del.php", "csrfToken=" + t("input[name=csrfToken]").val() + "&del[]=" + e, function(a) {
        if(a.code!=0){
            toastr.warning("刪除第"+mailNumber+"封信ERROR:"+a.message);
            console.log(a);
        }else{
            console.log(mailSn, "已刪除"+date+"的中獎通知:"+mailContent.replaceAll("\n",""))
            toastr.success("已刪除"+date+"的中獎通知");
        }
    }, "json");
}

function getMail(mailNumber) {
    var t = jQuery,
        i = window.mailbox,
        rawSn = myMailBox[mailNumber],
        e = rawSn.match(/[0-9]{10}_[0-9]{8}/)?.[0],
        date = myDate[mailNumber];

    if (!e) {
        toastr.warning("無法解析第" + mailNumber + "封信件編號");
        console.error("無法解析 data-sn:", rawSn);
        return;
    }

    changeButtonText("正在檢查第" + String(mailNumber) + "封信...", false);

    t.post({
        url: "/ajax/" + window.mailbox.boxType + "Read.php",
        data: { sn: e },
        dataType: "json",
        success: function(a) {
            if (a.code != 0) {
                toastr.warning("檢查第" + e + "封信ERROR:" + a.message);
                console.log(a);
            } else {
                var mailContent = strip(window.mailbox.changetxt(a.data));

                if (isAniBabi(mailContent)) {
                    delMail(e, date, mailContent, mailNumber);
                }
            }

            if (mailNumber + 1 < myMailBox.length) {
                setTimeout(function() {
                    getMail(mailNumber + 1);
                }, 150);
            } else {
                changeButtonText("刪除完畢 請點此重整頁面", true, myReload);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            changeButtonText("未知的錯誤 程序已停止", true, myReload);

            console.log("fail");
            console.log(e);
            console.log(
                mailNumber,
                e,
                date,
                XMLHttpRequest.statusText,
                textStatus,
                errorThrown
            );
        }
    });
}

function getMailList(page, totalPages) { // 讀取第 page 頁的信件列表
    var e = page;
    changeButtonText("正在讀第" + String(page) + "頁列表...", false);

    jQuery.post("/ajax/inboxList.php", {
        p: e,
        s: window.mailbox.searchUser
    }, function(t) {
        if (t.code != 0) {
            toastr.warning("讀取第" + e + "頁列表ERROR:" + t.message);
            console.log(t);
            return;
        }

        // inboxList.php 回傳的 data 是 HTML 字串
        var result = t.data.match(/data-sn="?[0-9]{10}_[0-9]{8}/g);
        var date = t.data.match(/[\d]{4}-[\d]{2}-[\d]{2}/g);

        // 防止某頁沒有符合的信件時造成 null
        if (result) {
            myMailBox = myMailBox.concat(result);
        }

        if (date) {
            myDate = myDate.concat(date);
        }

        if (page >= totalPages) {
            // 列表全部讀取完畢，開始讀取信件內容
            changeButtonText("正在刪除信件...", false);
            getMail(0);
        } else {
            // 依序讀取下一頁
            setTimeout(function() {
                getMailList(page + 1, totalPages);
            }, 100);
        }
    }, "json");
}


function startDelAniBabi() { // 查看所有信件
    toastr.options = {
        positionClass: 'toast-top-center',
        showDuration: 60,
        hideDuration: 120,
        tapToDismiss: false
    };

    // 現在的頁面格式：
    // 1 - 20 封（共 1844 封）
    var text = jQuery(".sticky-nav").text();

    var totalMatch = text.match(/共\s*([\d,]+)\s*封/);

    if (!totalMatch) {
        toastr.error("無法取得信件總數，程序已停止");
        console.error("無法解析信件總數：", text);
        return;
    }

    var totalMail = parseInt(totalMatch[1].replace(/,/g, ""), 10);
    var totalPages = Math.ceil(totalMail / 20);

    console.log("總信件數:", totalMail);
    console.log("總頁數:", totalPages);

    // 清空之前的資料，避免重複執行腳本時累積
    myMailBox = [];
    myDate = [];

    jQuery(".delAniBabi").off("click");

    getMailList(1, totalPages);
}

//初始化toastr通知
jQuery('head').append('<script src="https://i2.bahamut.com.tw/js/plugins/toastr-2.1.3.min.js?v=1498617831"></script>');
jQuery('head').append('<link href="https://i2.bahamut.com.tw/css/plugins/toastr.min.css?v=1498617831" rel="stylesheet" type="text/css">');
jQuery('head').append('<style> .toast-top-center { top: 80px; right: 0; width: 100%; } </style>');

(function() {
    //設置刪除中獎信按鈕
    var writeMail = jQuery(".BH-menu-forumA-back");
    writeMail.after(`<li class="BH-menu-forumA-back delAniBabi">
	<a class="is-active">刪除巴幣中獎信</a>
	</li>`);
    jQuery(".delAniBabi")[0].style.marginRight = "5px";
    jQuery(".delAniBabi").click(startDelAniBabi)

})();

/*reference
等元素載入完畢: https://www.itread01.com/content/1545263124.html
jQuery: https://ithelp.ithome.com.tw/articles/10095237
getType: http://iambigd.blogspot.com/2012/10/javascript.html
html2text: https://stackoverflow.com/questions/822452/strip-html-from-text-javascript
promise: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise
         https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Using_promises
正則: http://ccckmit.wikidot.com/regularexpression
run-at: https://codertw.com/程式語言/709052/#outline__1_9
插入在某元素之後: https://www.w3school.com.cn/jquery/jquery_dom_add.asp
在按鈕之間插入空格: https://stackoverflow.com/questions/19769033/jquery-beginner-how-to-insert-spaces-between-append
幫元素添加css: http://www.aaronlife.com/v1/notes/html_set_css_styles_using_javascript.html
正則的global用法與match: https://blog.csdn.net/vajoy/article/details/17020423
jQuery post:https://api.jquery.com/jquery.post/
            https://stackoverflow.com/questions/2833951/how-do-i-catch-an-ajax-query-post-error
串接array: https://www.w3schools.com/jsref/jsref_concat_array.asp
取消按鈕效果: https://api.jquery.com/click/
頁面重新整理: https://ithelp.ithome.com.tw/articles/10190061
*/
