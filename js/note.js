$(function(){
  var timemessage = localStorage.getItem("timemessage");
  var note = new Array;
  // 如果存在缓存需要先加载列表
  if (localStorage.getItem("my_note")){
    //先获取localStorage.getItem("my_note")的内容，转换为数组，以逗号为标志分开
    var str= localStorage.getItem("my_note");
    note = str.split(",");
    //缓存的note显示
    for(i=0;i<note.length;i++){
      if (i==0){
        $('#demo').after("<div class='todolist'><input type='checkbox'><span>"+note[i]+"</span></div>") ;
      } else {
        $('.todolist:last').after("<div class='todolist'><input type='checkbox'><span>"+note[i]+"</span></div>");
      }
    }
  }
  //点击“新增”按钮
  $('#addBtn').click(function(){
    //获取文本域输入内容
    var message= timemessage + $('#message').val();
    //点击添加后清空文本域
    $('#message').val("");
    //获取本地缓存内容，将新增内容添加到最后，并缓存
    if (localStorage.getItem("my_note")){
      note[note.length] = message;
      localStorage.setItem("my_note",note);
    }else {
      note[note.length] = message;
      localStorage.setItem("my_note",note);
    }

    if(!$.trim(message)){
      alert('不能为空，请添加备忘录');
      return false;
    }
    //历史note、添加新note
    if($('.todolist').length==0){
      $('#demo').after("<div class='todolist'><input type='checkbox'><span>"+message+"</span></div>")
    }else{
      $('.todolist:last').after("<div class='todolist'><input type='checkbox'><span>"+message+"</span></div>");
    }
  })
  //点击删除按钮
  $('#clearBtn').click(function(){
    if($('input:checkbox').length==0){
      alert('没有备忘录可以删除')
    }else if($('input:checked').length==0){
      alert('请选择备忘录删除')
    }
    //删除选中项，可同时删除多项
    var t=new Array;//t中存放选中项   
    var num = new Array; 
    var stringValue;
    var u=0; 
    //将选中项存入t中
    $('input:checked').each(function(){
      t[t.length]=$(this).parent().text();
    });
    //将t中存放的选中值，与note内容进行对比，二者相同，则删除  
    for (j=0;j<note.length;j++){
      for (i=0;i<t.length;i++){
        stringValue = note[j].localeCompare(t[i]);
        if(stringValue == 0){
          note.splice(j,1);
          j--;//此处将note数组的对比位置不变，因为删除项后，note数组后续项都需要前移
          break;
        }
      }
    }
    //存储最终的note记录
    localStorage.setItem("my_note",note);
    //删除选中内容
    $('input:checked').parent().remove();
    //点击返回，加载日历界面
    $('#comeback').click(function(){
      window.onload.index.html;
    })
  })
})