var pdf=document.getElementById('pdf');
var btn=document.getElementById('tlr');

btn.onclick = function(){
    var file=pdf.files[0];
    if(!file){
        alert("please upload a file");
        return;
    }else{
        var reader=new FileReader();
        reader.readAsArrayBufferS('pdf');
        reader.onload = function(){
            var pdfdata=reader.result;
            const loadingtask=getdocument
        }
    }
};