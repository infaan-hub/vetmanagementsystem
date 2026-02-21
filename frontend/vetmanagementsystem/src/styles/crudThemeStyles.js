export const crudThemeStyles = `
.crud-page{
  min-height:100vh;
  background-image:url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
  background-size:cover;
  background-position:center;
  background-repeat:repeat;
  font-family:"Segoe UI",Tahoma,Verdana,sans-serif;
  color:#111;
  padding:20px;
}
.crud-content{
  max-width:1100px;
  margin:0 auto;
}
.crud-content h1{
  margin:0 0 18px;
  text-align:center;
  background:rgba(255,255,255,0.72);
  backdrop-filter:blur(14px);
  border-radius:18px;
  padding:20px;
  box-shadow:0 18px 40px rgba(0,0,0,0.18);
}
.crud-content form{
  background:rgba(255,255,255,0.72);
  backdrop-filter:blur(14px);
  border-radius:18px;
  box-shadow:0 18px 40px rgba(0,0,0,0.18);
  padding:16px;
  margin-bottom:18px;
  display:grid;
  gap:10px;
}
.crud-page input,.crud-page select,.crud-page textarea,.crud-page button{
  border-radius:12px;
  border:1px solid rgba(0,0,0,0.14);
  padding:10px 12px;
  font-size:14px;
}
.crud-page textarea{min-height:88px}
.crud-page button{
  width:auto;
  border-radius:999px;
  font-weight:700;
  background:rgba(255,255,255,0.42);
  cursor:pointer;
  transition:transform .16s ease, background .16s ease, color .16s ease;
}
.crud-page button:hover{
  transform:translateY(-3px);
  background:rgba(0,0,0,0.85);
  color:#fff;
}
.crud-list{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:14px;
  margin-top:10px;
}
.crud-record-card{
  background:rgba(255,255,255,0.72);
  backdrop-filter:blur(14px);
  border-radius:16px;
  box-shadow:0 18px 40px rgba(0,0,0,0.18);
  padding:12px;
  margin-bottom:8px;
}
.status-msg{
  margin:8px 0 12px;
  font-weight:600;
}
.action-btn{
  background:rgba(0,0,0,0.9) !important;
  color:#fff !important;
  border:1px solid rgba(0,0,0,0.92) !important;
}
.action-btn:hover{
  background:#000 !important;
  color:#fff !important;
}
`;
