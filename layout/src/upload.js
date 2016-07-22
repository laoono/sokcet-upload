/*
 * @author: laoono
 * @date: 2015-06-04
 * @time: 17:26:36
 * @contact: laoono.com
 */

var upload = function (o) {

    o = o || {};
    if (typeof o !== "object") return;
    var opts = {
        input: o.input || "#file" //input:file标签
        , button: o.button || "#button"
        , type: o.type || "jpg,jpeg,gif,png" //上传文件类型限制
        , mult: o.mult || false //多张上传开关
        , uploader: o.uploader || "http://m.dev.fh21.com/iask/question/uploadimg.php" //上传URL
        , size: o.size || 5 * 1024 * 1024 //上传大小限制单位：Byte
        , num: o.num || 6 //一次上传文件数量限制
        , formData: o.formData || {} //发送字符串

        , onSelect: o.onSelect || null //选择合法文件触发 onSelect(files, xhr, time) files: 当前文件列表; xhr: 当前xhr对像; time: 当前上传队列
        , onSelectError: o.onSelectError || null // 选择非法文件触发 onSelectError(json) json:当前选择文件不合法参数
        , onUploadSuccess: o.onUploadSuccess || null //上传成功触发 onUploadSuccess(files, data, time) files: 当前文件列表; data: 成功返回值; time: 当前上传队列
        , onUploadError: o.onUploadError || null //上传失败触发 onUploadError(files, (status|e), time); files: 当前文件列表; status: 失败返回值或者progress事件对象; time: 当前上传队列
        , onProgress: o.onProgress || null // 上传进度触发 onProgress(files, uploaded, total, time)  files: 当前文件列表; uploaded: 已上传; total: 上传总量; time: 当前上传队列
    };

    //全局变量
    var d = document
        , time = 0
        , button = d.querySelector(opts.button)
        , input = d.querySelector(opts.input)

        , field_file = input.name || "FH_FILE"
        , fields = opts.formData
        , xhr = {}
        , form_data = null;

    //<is_limt
    var is_limit = function (opts, files) { //上传文件条件

        if (typeof opts !== "object") return;

        var disabled = false
            , error = "不是果照，不要发"
            , code = 100
            , files = files || null
            , len = files.length
            , file_type = ""
            , type = opts.type
            , size = opts.size
            , num = opts.num

        if (len == 0) {

            disabled = true;
            error = "请选择文件"
            code = 104
        } else if (len > num) {

            disabled = true;
            error = "超出文件数量";
            code = 101;
        } else {

            for (var i = 0; i < len; ++i) {

                if (files[i].size > size) {
                    disabled = true;
                    error = "单个文件大小不超过" + parseFloat(files[i]/1024/1024).toFixed(10).replace(/\.0{1,}$/, "") + "MB";
                    code = 102;
                    break;
                } else {


                    if (files[i].type) {
                        file_type = files[i].type.replace(/\w+\/*/, "");
                    } else {
                        if (/.+\..+/g.test(files[i].name)) {
                            file_type = files[i].name.replace(/.+\./, "");
                        } else {
                            file_type = type;
                        }
                    }

                    if (type.indexOf(file_type) === -1) {
                        disabled = true;
                        error = "文件上传格式:" + type;
                        code = 103;
                        break;
                    }
                }
            }
        }

        return {
            disabled: disabled
            , error: error
            , code: code
        }
    };//is_limt>

    var upload_files = function (files, time) {

        var url = opts.uploader;

        xhr = new XMLHttpRequest();
        form_data = new FormData();

        for (var i = 0, len = files.length; i < len; ++i) {
            form_data.append(field_file, files[i]);
        }

        for (var k in fields) {
            form_data.append(k, fields[k]);
        }

        xhr.addEventListener("load", function () {
            var status = xhr.status
                , data = xhr.responseText;

            if (status >= 200 && status < 300 || status == 304) {
                is_func(opts.onUploadSuccess) && opts.onUploadSuccess(files, data, time);
                input.value = "";
            } else {
                is_func(opts.onUploadError) && opts.onUploadError(files, status, time);
            }
        }, false);

        xhr.upload.addEventListener("progress", function (e) {
            var loaded = e.loaded
                , total = e.total;

            if (e.lengthComputable) {
                is_func(opts.onProgress) && opts.onProgress(files, loaded, total, time);
            }
        }, false);

        xhr.addEventListener("error", function (e) {
            is_func(opts.onUploadError) && opts.onUploadError(files, e, time);
        }, false);

        xhr.open("post", url, true);
        xhr.send(form_data);
    };

    var is_func = function (arg) {
        arg = (typeof arg).toLowerCase();

        return arg === "function" ? true : false;
    };

    var init = function (opts, files, seq_id) {

        var limit = is_limit(opts, files);

        if (limit.disabled) {
            is_func(opts.onSelectError) ? opts.onSelectError(JSON.stringify(limit)) : (alert(limit.error));
        } else {
            xhr.sequenceID = seq_id;

            upload_files(files, xhr.sequenceID);
            is_func(opts.onSelect) && opts.onSelect(files, xhr, seq_id);

            time++;
        }
    };

    button.addEventListener("click", function () {
        init(opts, input.files, time);
    }, false);

    return xhr;
};