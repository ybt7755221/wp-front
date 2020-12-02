$(function(){
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
            $.alert({
                title:"错误",
                type: 'red',
                content:'必填字段不能为空!'
            });
        } else {
            $.post("/pages/save",data,function(data,status){
                if (status == 'success') {
                    if (data.code == 1000) {
                        let html = "<tr id='work_"+data.data.id+"'>";
                        html += '<td>'+$('#project_id option:selected').html()+'</td>';
                        html += '<td>'+$('#work_type option:selected').html()+'</td>';
                        html += '<td>'+data.data.title+'</td>';
                        html += '<td>'+data.data.url+'</td>';
                        html += '<td><div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="'+data.data.progress+'" aria-valuemin="0" aria-valuemax="100" style="width: '+data.data.progress+'%;">'+data.data.progress+'%</div></div></td>';
                        html += '<td>'+data.data.backup+'</td>';
                        html += '<td>'+data.data.created+'</td>';
                        html += '<td><button onclick="delWork('+data.data.id+')">删除</button></td>'
                        html += "</tr>";
                        $('#table').append(html);
                    }else{
                        $.alert({
                            title:"错误",
                            type: 'red',
                            content:data.msg
                        })
                    }
                }else{
                    $.alert({
                        title:"错误",
                        type: 'red',
                        content:data
                    })
                }
            });
        }
    });
    $('.infoBtn').click(function (event) {
        let id = $(this).attr('var-id');
        let key = '#work_'+id;
        let title = $(key+' .title').html();
        let project_id = $(key+' .project_id').html();
        let progress = $(key+' .pgs').html();
        let work_type = $(key+' .work_type').html();
        let backup = $(key+' .backup').html();
        let created = $(key+' .created').html();
        let updated = $(key+' .updated').html();
        let url = $('#url_'+id).html();
        $('#ml_title').html(title);
        $('#ml_project_id').html(project_id);
        $('#ml_progress').html(progress);
        $('#ml_work_type').html(work_type);
        $('#ml_backup').html(backup);
        $('#ml_created').html(created);
        $('#ml_updated').html(updated);
        $('#ml_url').html(url);
        $('#workDesc').modal('show')
    });
    $(".paging").click(function(event) {
        let type = $(this).attr('id');
        let isLast = $(this).attr('var-isLast');
        let currentPage = $(this).attr('var-cp');
        let page = Number(currentPage);
        if (type == 'prev') {//上一页
            if (currentPage == 1) {
                $.alert({title:'', type:'red', content:'已经是第一页'});
                return
            }
            page = page - 1;
        }else if (type == 'next') {//下一页
            if (isLast == 1) {
                $.alert({title:'', type:'red', content:'已经是最后一页'});
                return
            }
            page = page + 1;
        }else{
            $.alert({title:'', type:'red', content:'非法操作'});
            return
        }
        window.location.href="/pages?page="+page;
    });
});

function delWork(id) {
    $.confirm({
        title: '删除',
        type: 'green',
        content: '确定删除？',
        buttons: {
            confirm: function () {
                var user_id = $("#LoginUserId").val()
                $.post("/pages/delWork",{id:id, user_id:user_id},function(data,status){
                    if (status == 'success') {
                        if (data.code == 1000) {
                            $.alert({
                                title:"成功",
                                type: 'green',
                                content:'删除成功'
                            })
                            $('#work_'+id).remove();
                        }
                    }else{
                        $.alert({
                            title:"错误",
                            type: 'red',
                            content:data
                        })
                    }
                });
            },
            cancel: function () {
            }
        }
    });
}