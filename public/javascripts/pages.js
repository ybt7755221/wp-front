$(document).ready(function(){
    $('#work_type').select2();
    $('#progress').select2();
    $('#project_id').select2();
    $("#start_id").datetimepicker({
        format  : 'yyyy-mm-dd',//显示格式
        minView: "month", //选择日期后，不会再跳转去选择时分秒 
        language: 'zh-CN',
        autoclose: 1,//选择后自动关闭
        clearBtn:true,//清除按钮
    });

    $('#submit').click(function(e) {
        let data = {};
        let arr = $('form').serializeArray();
        $.each(arr, function() {
            data[this.name] = this.value;
        });
        if (data['progress'] == "" || data['title'] == "" || data['project_id'] == "" || data['created'] == "") {
            alert('必填字段不能为空！');
        } else {
            $.post("/pages/save",data,function(data,status){
                if (status == 'success') {
                    if (data.code == 1000) {
                        let html = "<tr id='work_"+data.data.id+"'>";
                        html += '<td>'+$('#project_id option:selected').html()+'</td>';
                        html += '<td>'+$('#work_type option:selected').html()+'</td>';
                        html += '<td>'+data.data.title+'</td>';
                        html += '<td>'+data.data.url+'</td>';
                        html += '<td>'+data.data.progress+'%</td>';
                        html += '<td>'+data.data.backup+'</td>';
                        html += '<td>'+data.data.created+'</td>';
                        html += '<td><button onclick="delWork('+data.data.id+')">删除</button></td>'
                        html += "</tr>";
                        $('#table').append(html);
                    }else{
                        alert(data.msg)
                    }
                }else{
                    alert(data)
                }
            });
        }
    });
});

function delWork(id) {
    var user_id = $("#LoginUserId").val()
    $.post("/pages/delWork",{id:id, user_id:user_id},function(data,status){
        if (status == 'success') {
            if (data.code == 1000) {
                alert("删除成功")
                $('#work_'+id).remove();
            }
        }else{
            alert(data)
        }
    });
}