/**
 * @author: laoono
 * @date:  2016-06-02
 * @time: 11:29
 * @contact: laoono.com
 * @description: #
 */
((function (w, d) {
    var file = d.querySelector("#fileUpload")
        , btn = d.querySelector("#btn")
        , fileList = d.querySelector("#file-list")
        , socketList = d.querySelector(".file-socket-lists")
        , name = d.querySelector("#field-name")
        , script = d.querySelector("#script")
        , input = d.getElementById("file-name");

    file.addEventListener("change", function () {
        input.value = file.value;

        btn.disabled = file.value.length ? false : true;
    }, !1);

    !(localStorage.getItem("user") && localStorage.getItem("user").length >= 2) && (d.querySelector(".field-name-wrap").style.display = "block");

    d.addEventListener("keydown", function (event) {
        event = event || window.event;

        var value = name.value;
        if (event.keyCode == 13 && (document.activeElement.id == "field-name")) {
            value.trim().length >= 2 && (localStorage.setItem("user", value), d.querySelector(".field-name-wrap").style.display = "none");
        }
    }, false);

    var socketView = function (data) {
        data = data || {};
        var html = socketList.innerHTML
            , view = "";

        view = "<div>";
        view += "<span class='file-socket-list-name'>";
        view += data.user;
        view += "</span>";

        view += "<span>上传了一张图片</span>";

        view += "<a id='file-socket-list-link' target='_blank' href='";
        view += data.href;
        view += "' class='link'>查看</a>";

        view += "</div>";

        if (fileList.querySelector("span").innerHTML == data.href) {
            view = "";
        }

        html += view;
        socketList.innerHTML = html;
    };

    var wsUrl = script.getAttribute("data-ws-url");
    var wsEnabled = /^ws:\/\/.+/.test(wsUrl) ? true : false;
    var flag
        ,ws;
    
    var socket = function (cb) {
        if (wsEnabled) {

            // console.log(flag, ws);
            if (flag && (ws.readyState == 0 || ws.readyState == 1)) {
                // ws.close();
                cb(ws);
            } else {
                ws = new WebSocket(wsUrl);
                flag = true;
            }

            ws.onmessage = function (evt) {
                var data = JSON.parse(evt.data);
                socketView(data);
            };

            ws.onopen = function () {
                var data = {
                    online: true
                };
            
                data = JSON.stringify(data);
                
                setInterval(function() {
                    
                    ws.send(data);
                }, 25 * 1000);   
            };
            
            return ws;
        }
    };

    socket();
    

    function uploadPic() {
        var imgCrrrent;
        var imgOverlay;
        var imgNumber;
        var imgRemove;
        var cur_time = 0;
        var loading = d.querySelector("#loading");

        //上传图片
        upload({
            input: "#fileUpload",
            button: "#btn",
            type: "gif,jpeg,jpg,png,bmp",
            size: 3 * 1024 * 1024,
            num: 1,
            uploader: "/upload",
            onSelect: function (files, xhr, time) {

                loading.style.display = "block";

                return;
                if ($("#imgWrapper li").length == this.num) {
                    uploadBtn.hide();
                }
                if ($("#imgWrapper li").length - 1 >= this.num) {
                    xhr.abort();
                    toast.create("您最多只能上传" + this.num + "张图片").destory();
                    return false;
                }

                btn.attr("disabled", "disabled");
                $("#fileUpload").attr("disabled", "disabled");
                var li = $("<li></li>");
                imgCrrrent = $("<img />");
                imgOverlay = $("<span></span>");
                imgNumber = $("<i>0%</i>");
                imgRemove = $("<b></b>");
                imgRemove.bind("click", function () {
                    xhr.abort();
                    cur_time--;
                    $(this).parent().remove();
                    $("#fileUpload").removeAttr("disabled");
                    btn.removeAttr("disabled", "disabled")
                    uploadBtn.show();
                });
                cur_time++;
                li.append(imgCrrrent);
                li.append(imgOverlay);
                li.append(imgNumber);
                li.append(imgRemove);

                $("#bUploadBoxWrap").before(li);
                imgCrrrent.css("backgroundColor", "#ccc");

                if (!FrEabled) {
                    return
                }

                var fixBase64 = function (b64) {

                    var tmp = b64.substring(0, 100);
                    if (tmp.search("data:image/jpeg") == -1) {
                        b64 = b64.replace("data:", "data:image/jpeg;");
                    }

                    return b64;
                };

                var file_reader = new FileReader();
                file_reader.readAsDataURL(files[0]);

                file_reader.onload = function () {
                    var src = fixBase64(this.result);
                    imgCrrrent.attr("src", src);
                };

                file_reader.onerror = function () {
                    toast.create("图片读取失败,请重试");
                };
            },
            onSelectError: function (data) {
                var data = JSON.parse(data);

                switch (data.code) {
                    case 101:
                        alert("您最多只能上传" + this.num + "张图片");
                        break;
                    case 102:
                        alert("图片不能大于1M");
                        break;
                    case 103:
                        alert("图片格式不正确");
                        break;
                    case 104:
                        alert("请选择文件");
                        break;
                }
            },

            onProgress: function (files, uploaded, total, time) {

                var percent = parseInt(uploaded / total * 100),
                    up = 0,
                    down = 99;

                up = percent;

                if (uploaded < total) {
                    down -= up;
                } else {
                    up = 100;
                    down = 0;
                }

                loading.innerHTML = (up + "%");
            },
            onUploadSuccess: function (files, data, time) {
                data = JSON.parse(data) || {};

                var code = data.code
                    , url = data.data;

                input.value = "";
                loading.style.display = "none";

                if (code == 100) {
                    fileList.querySelector("span").innerHTML = url;
                    fileList.querySelector("a.link").href = url;
                    fileList.querySelector("a.link").innerHTML = "预览";

                    var mesg = {
                        user: localStorage.getItem("user") || "gay"
                        , href: url
                    };

                    socket(function(ws) {
                        ws.send(JSON.stringify(mesg));
                    });
                    
                } else {
                    alert("上传失败");
                }
            },
            onUploadError: function () {
            }
        });
    }

    uploadPic();

    file.addEventListener("drop", function(e) {
        e.stopPropagation();
        setTimeout(function() {
            btn.click();
        }, 1000);
    }, false);
})(window, window.document)); 
 