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
.crud-shell{
  display:flex;
  gap:20px;
}
.crud-sidebar{
  width:260px;
  flex-shrink:0;
  background:rgba(255,255,255,.72);
  backdrop-filter:blur(14px);
  border-radius:18px;
  padding:18px 14px;
  box-shadow:0 18px 40px rgba(0,0,0,.18);
  height:fit-content;
}
.crud-sidebar h2{
  margin:0 0 12px;
  text-align:center;
  font-size:20px;
}
.crud-nav a{
  display:block;
  text-decoration:none;
  color:#111;
  font-weight:700;
  padding:10px 12px;
  border-radius:12px;
  margin-bottom:8px;
}
.crud-nav a:hover,.crud-nav a.active{
  background:rgba(0,0,0,.88);
  color:#fff;
}
.crud-main{
  flex:1;
  min-width:0;
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
.crud-list{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
  gap:14px;
  margin-top:10px;
}
.patient-photo{
  width:120px;
  height:160px;
  object-fit:cover;
  border-radius:8px;
  background:#eee;
  border:1px solid rgba(0,0,0,0.1);
}
.crud-page input,.crud-page select,.crud-page textarea,.crud-page button{
  border-radius:12px;
  border:1px solid rgba(0,0,0,0.14);
  padding:10px 12px;
  font-size:14px;
}
.crud-page label{
  display:block;
  font-weight:700;
  margin:2px 0 4px;
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
@media (max-width: 900px){
  .crud-shell{
    flex-direction:column;
    gap:12px;
  }
  .crud-sidebar{
    width:100%;
  }
}
@media (max-width: 430px){
  .crud-page{
    padding:10px;
  }
  .crud-content form{
    padding:12px;
  }
  .crud-page button{
    width:100%;
  }
  .patient-photo{
    width:96px;
    height:128px;
  }
}
`;
