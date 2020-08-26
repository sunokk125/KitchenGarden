var express = require('express');
var router = express.Router();
var db = require('../configs/db');
var con_index = require('../controllers/controllers.index');


router.get('/', async function(req, res, next) {
  try {
    console.log(req.session.user);
    const best = await db.any("select goods.g_id,goods.name,goods.price,sum(orders_goods.quantity) as sum from orders_goods left join goods on orders_goods.g_id=goods.g_id group by goods.g_id order by sum desc, g_id asc limit 6");
    const gardens = await db.any("select * from gardens order by gr_id limit 5");
    const newly = await db.any("select * from gardens order by gr_id desc limit 1");
    console.log(gardens);
    if(!req.session.user){
      res.render('index', {'session':false,'best': best,'gardens':gardens,'newly':newly[0]});
    }else{
      res.render('index', { 'session':req.session.user,'best': best,'gardens':gardens,'newly':newly[0] });
    }
  } catch (e) {
    console.log(e);
  }
});

router.route('/farm').get(con_index.farm);

router.get('/mypage',async function(req, res, next) {
  console.log(req.session.user);

  var o_count = new Array();
  var first_goods = new Array();

  const user = await db.any("select * from users where u_id=$1",req.session.user.u_id);
  const count = await db.any("select count(*) from carts where c_u_id=$1",req.session.user.u_id);
  const orders = await db.any("select * from orders where o_u_id=$1",req.session.user.u_id);

  for(var i=0; i < orders.length; i++){
    var goods = new Object();

    const orders_goods=await db.any("select goods.name as name , goods.g_id as g_id from orders_goods left join goods on orders_goods.g_id = goods.g_id where o_id=$1",orders[i].o_id);
    const order_count = await db.one("select count(*) as count from orders_goods where o_id=$1",orders[i].o_id);
    o_count.push(order_count.count);
    goods.g_id=orders_goods[0].g_id;
    goods.name=orders_goods[0].name;

    first_goods.push(goods);
    
  }
  if(!req.session.user){
    res.render('mypage', {"session":false});
  }else{
    res.render('mypage', { "session":req.session.user ,"user":user[0],'count':count[0].count,'orders':orders,'o_count':o_count,'first_goods':first_goods});
  }
});

router.get('/mypage/:o_id',async function(req, res, next) {
  console.log(req.session.user);

  var o_id= req.params.o_id;

  const user = await db.any("select * from users where u_id=$1",req.session.user.u_id);
  const count = await db.any("select count(*) from carts where c_u_id=$1",req.session.user.u_id);
  const goods = await db.any("select * from orders_goods left join goods on orders_goods.g_id = goods.g_id where o_id=$1",o_id);


  if(!req.session.user){
    res.render('mypage_goods', {"session":false});
  }else{
    res.render('mypage_goods', { "session":req.session.user ,"user":user[0],'count':count[0].count,'goods':goods});
  }
});

router.get('/point',async function(req, res, next) {
  console.log(req.session.user);


  const user = await db.any("select * from users where u_id=$1",req.session.user.u_id);
  const count = await db.any("select count(*) from carts where c_u_id=$1",req.session.user.u_id);
  const points = await db.any("select * from points where p_u_id=$1 order by p_date desc",req.session.user.u_id);

  var dateArray = new Array();

  for(var i=0;i<points.length;i++){
    var p_date = points[i].p_date;
    var date = p_date.getFullYear() + "."+(1+p_date.getMonth())+"."+p_date.getDate();
    console.log( "date : "+date);
    dateArray.push(date);
  }

  console.log(dateArray);

  if(!req.session.user){
    res.render('mypage_point', {"session":false});
  }else{
    res.render('mypage_point', { "session":req.session.user ,"user":user[0],'count':count[0].count,'points':points,'date': dateArray});
  }
});

router.get('/update',async function(req, res, next) {
  console.log(req.session.user);

  const user = await db.any("select * from users where u_id=$1",req.session.user.u_id);
  const count = await db.any("select count(*) from carts where c_u_id=$1",req.session.user.u_id);

  var email=user[0].email.split("@");
  var phone=user[0].phone.split("-");


  if(!req.session.user){
    res.render('mypage_update', {"session":false});
  }else{
    res.render('mypage_update', { "session":req.session.user ,"user":user[0],'count':count[0].count,'email':email,'phone':phone});
  }
});

router.post('/update',async function(req, res, next) {
  var u_id=req.body.u_id;
  var pw = req.body.pw;
  var name = req.body.name;
  var email,phone;
  var email1 = req.body.email1;
  var email2 = req.body.email2;
  email = email1+"@"+email2;
  var phone1=req.body.phone1;
  var phone2=req.body.phone2;
  var phone3=req.body.phone3;
  phone = phone1+"-"+phone2+"-"+phone3
  var zonecode = req.body.zonecode;
  var roadAddress = req.body.roadAddress;
  var jibunAddress = req.body.jibunAddress;
  var detailAddress = req.body.detailAddress;

  const update = db.any("update users set name=$1,password=$2,email=$3,phone=$4,zonecode=$5,roadaddress=$6,jibunaddress=$7,detailaddress=$8 where u_id=$9",[name,pw,email,phone,zonecode,roadAddress,jibunAddress,detailAddress,u_id]);

  res.redirect('/mypage');
});

//구현중
router.post('/deleteUser',async function(req, res, next) {
  var u_id = req.body.u_id;

  //워터 지우고 팜지우고 포인트지우고 오더굿즈 지우고 오더지우고 유저지우고
  const f_list = await db.any("select * from farms where f_u_id=$1",u_id);
  for(var i=0; i < f_list.length;i++){
    const water = await db.any("delete from waters where w_f_id=$1",f_list[i].f_id);
  }
  const farms = await db.any("delete from farms where f_u_id=$1",u_id);
  const points = await db.any("delete from points where p_u_id=$1",u_id);
  const o_list = await db.any("select * from orders where o_u_id=$1",u_id);
  for(var i=0; i < o_list.length;i++){
    const orders_goods = await db.any("delete from orders_goods where o_id=$1",o_list[i].o_id);
  }
  const orders = await db.any("delete from orders where o_u_id=$1",u_id);
  const carts = await db.any("delete from carts where c_u_id=$1",u_id);
  const users = await db.any("delete from users where u_id=$1",u_id);

  req.session.destroy();
  res.redirect('/');
});
//구현중 끝


function AddComma(value) {
  return Number(value).toLocaleString('en');
}

router.get('/store', async function(req, res, next) {
  console.log(req.session.user);
  const goods = await db.any("select * from goods where category=1");
  console.log(goods);
  if(!req.session.user){
    res.render('store', {"session":false, "goods":goods});
  }else{
    res.render('store', { "session":req.session.user,"goods":goods });
  }
});

router.post('/store', async function(req, res, next) {
  try {
    console.log(req.session.user);
    var num = req.body.num;
    const goods = await db.any("select * from goods where category=$1",num);
    console.log(goods);
    res.json({'goods':goods});
  } catch (e) {
    console.log(e);
  }
});



router.get('/goods/:g_id', async function(req, res, next) {
  var g_id = req.params.g_id;
  console.log(g_id);
  const goods = await db.any("select * from goods where g_id=$1",g_id);
  if(!req.session.user){
    res.render('goods', {"session":false,"goods":goods[0]});
  }else{
    res.render('goods', { "session":req.session.user,"goods":goods[0] });
  }
});

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

router.route('/login').post(con_index.login);

router.get('/logout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
});


router.get('/join', function(req, res, next) {
  res.render('join', { title: 'Express' });
});
router.post('/join', async function(req,res,next){
  try {
    var id = req.body.id;
    var pw = req.body.pw;
    var name = req.body.name;
    var email = req.body.email1+"@"+req.body.email2;
    var phone = req.body.phone1+"-"+req.body.phone2+"-"+req.body.phone3;
    var zonecode = req.body.zonecode;
    var roadAddress = req.body.roadAddress;
    var jibunAddress = req.body.jibunAddress;
    var detailAddress = req.body.detailAddress;
    console.log(id+","+pw+","+name+","+email+","+phone+","+zonecode+","+roadAddress+","+jibunAddress+","+detailAddress);
    
    const join = await db.any("insert into users(id,name,password,email,phone,zonecode,roadAddress,jibunAddress,detailAddress) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    [id,name,pw,email,phone,zonecode,roadAddress,jibunAddress,detailAddress]);
  
    res.redirect('/');  
  } catch (e) {
    console.log(e);
  }
  
});

router.post('/idChk', async function(req,res,next){
  try{
    const id = req.body.id;

    console.log(id);
    
    const idChk = await db.any("select * from users where id=$1",id);

    if(!idChk.length){
      /*값이 없을때*/
      res.json({'result':true});
    }else{
      /*값이 있을때*/
      res.json({'result':false});
    }
  }catch(e){
    console.log(e);
  }
})


router.post('/saveSeed',async function(req, res, next){
  try {
    const id = req.body.sessionId;
    const goodId = req.body.goodId;

    const goods = await db.one("select * from goods where g_id=$1",goodId);
    var max_water=goods.g_max_water/5
    console.log("max_water : " + max_water);
    
    
    const createFarm = await db.any("insert into farms(f_g_id, f_u_id, manure, remove, pesticide) values($1,$2,false,false,false)",[goodId,id]);
    const loadFid = await db.any("select * from farms left join goods on farms.f_g_id = goods.g_id where f_u_id=$1",id);
    console.log(loadFid);
    res.json({'loadFid':loadFid});
    
  } catch (e) {
    console.log(e+"saveseed");
  }
});

router.post('/changeMySeed', async function(req, res, next) {
  const fid=req.body.fid;

  const result = await db.any("select * from farms left join goods on farms.f_g_id = goods.g_id where f_id=$1",fid);
  console.log(result);

  res.json({'result':result[0]});
});

router.post('/water', async function(req, res, nest){
  try {
    const fid = req.body.f_id;
    const cur_date = await db.any("select current_date");
    var date = cur_date[0].current_date;

    console.log("fid : "+fid);

    const max_water = await db.any("select * from farms left join goods on farms.f_g_id = goods.g_id where f_id=$1;",fid);
    var maxWater=max_water[0].max_water;

    const result = await db.any("select * from waters where w_date=$1 and w_f_id=$2",[date,fid]);
    if(!result.length){
      /*값이 없을때(물을 아직안줌)*/ 
      const add = await db.any("insert into waters(w_f_id) values($1)",fid);
      const count = await db.any("select count(*) from waters where w_f_id=$1 and date_tf=true",fid);
      console.log("count[0].count:"+count[0].count);
      const water = await db.any("update farms set water=$1 where f_id=$2",[count[0].count,fid]);
      var random =Math.floor(Math.random() * 10) + 1;
      console.log("random:"+random);
      if(count[0].count!=15&&random==8){
        const remove = await db.any("update farms set remove=true where f_id=$1",fid);
        const seed= await db.any("select * from farms left join goods on farms.f_g_id=goods.g_id where f_id=$1",fid);
        res.json({'result':true, 'count':count[0].count,'seed':seed[0],'maxWater':maxWater});
      }else if(count[0].count!=15&&random==9){
          const pesticide = await db.any("update farms set pesticide=true where f_id=$1",fid);
          const seed= await db.any("select * from farms left join goods on farms.f_g_id=goods.g_id where f_id=$1",fid);
          res.json({'result':true, 'count':count[0].count,'seed':seed[0],'maxWater':maxWater});
      }else{
          const seed= await db.any("select * from farms left join goods on farms.f_g_id=goods.g_id where f_id=$1",fid);
          res.json({'result':true, 'count':count[0].count,'seed':seed[0],'maxWater':maxWater});
      }
      
    }else{
      /*값이 있을때(물을 이미줌)*/
      const count = await db.any("select count(*) from waters where w_f_id=$1 and date_tf=true",fid);
      res.json({'result':false, 'count':count[0].count});
    }
    
  } catch (e) {
    console.log(e+"[2]");
  }
});

router.post('/manure', async function(req, res, next) {
  try {
    const fid = req.body.fid;
    const seed = await db.any("select * from farms where f_id=$1",fid);
    console.log(seed[0].manure);
    if(!seed[0].manure){/*값이 없을때*/ 
      const manure = await db.any("update farms set manure=true where f_id=$1",fid);
      const result = await db.any("select * from farms where f_id=$1",fid);
      res.json({"result":result[0],"tf":false});
      console.log("1");
    }else{/*값이 있을때*/
      res.json({"tf":true});
    }
  } catch (e) {
    console.log("manure : "+e)
  }
});
router.post('/remove', async function(req, res, next) {
  const fid = req.body.fid;
  const remove = await db.any("update farms set remove=false where f_id=$1",fid);
  res.json({"tf":true});
});
router.post('/pesticide', async function(req, res, next) {
  const fid = req.body.fid;
  const remove = await db.any("update farms set pesticide=false where f_id=$1",fid);
  res.json({"tf":true});
});


router.post('/harvest', async function(req, res, next) {
  try {
    const u_id = req.body.u_id;
    console.log(u_id);
    
    const del = await db.any("update waters set date_tf=false where w_u_id=$1 and date_tf=true",u_id);
    
    const count = await db.any("select count(*) from waters where w_u_id=$1 and date_tf=true",u_id);

    res.render('farm',{session:req.session.user,count:count[0].count});
  } catch (e) {
    console.log(e+"[4]");
    
  }
});

router.get('/order',async function(req,res,next){
  try {
    var cid = req.query.c_id;
    var c_id =  new Array();
    var gid = req.query.g_id;
    var g_id = new Array();
    var quan=req.query.quantity;
    var quantity = new Array();
    var total=0;
    var deliveryCost=0;
    if(Array.isArray(gid)){
      g_id=gid;
      quantity=quan;
      c_id=cid;
    }else{
      g_id.push(gid);
      quantity.push(quan);
      c_id.push(cid);
    }
    console.log(g_id);
    console.log(quantity);
    console.log(c_id);
    if(!req.session.user){
      res.send('<script>alert("로그인이 필요합니다.");location.href="/login"</script>');
    }else{
      var goods = new Array();
      for(var i=0;i < g_id.length;i++){
        var item = await db.one("select * from goods where g_id = $1",g_id[i]);
        item.quantity = quantity[i];
        item.total = parseInt(item.price)*parseInt(quantity[i]);
        total+=parseInt(item.price)*parseInt(quantity[i]);

        goods.push(item);
      }
      const user = await db.any("select * from users where u_id=$1",req.session.user.u_id);

      var phone = user[0].phone;
      var phArray = phone.split("-");
      console.log(goods);
      console.log("total:"+total);
      if(total>50000){
        deliveryCost=0;
      }else{
        deliveryCost=2500
      }
      res.render('order', {"session":req.session.user,"goods":goods,"phone":phArray,"user":user[0],"count":g_id.length,"total":total,"c_id":c_id,"deliveryCost":deliveryCost});

    }
  } catch (e) {
    console.log(e+"order");
  }
});

router.post('/order', async function(req,res,next){
  try {
    var u_id=req.session.user.u_id;
    
    const getPoint = await db.one("select * from users where u_id = $1",u_id);
    console.log(getPoint);

    var point = getPoint.point;
    var cid = req.body.c_id;
    console.log(cid);
    var c_id = new Array();
    var gid = req.body.g_id;
    var g_id = new Array();
    var quan=req.body.quantity;
    var quantity = new Array();
    var delivery = req.body.delivery;
    var email = req.body.email;
    var usePoint = req.body.usePoint;
    var total = req.body.total;
    var input_total = req.body.input_total;
    var input_discount = req.body.input_discount;
    var input_deliveryCost = req.body.input_deliveryCost;
    var zonecode,roadAddress,jibunAddress,detailAddress,name,phone1,phone2,phone3,memo;
    var payment = req.body.pay;
    console.log("input_total : " +input_total+"\n"+"input_dc : " +input_discount+"\n"+"input_de : " +input_deliveryCost+"\n"+"input_pay : " +payment+"\n");

    if(Array.isArray(gid)){
      c_id=cid;
      g_id=gid;
      quantity=quan;
    }else{
      if(cid!=''){
        c_id.push(cid);
      }
      g_id.push(gid);
      quantity.push(quan);
    }
    console.log(g_id);
    console.log(quantity);
    console.log(u_id);

    if (delivery=='1') {
      zonecode=req.body.zonecode;
      roadAddress=req.body.roadAddress;
      jibunAddress=req.body.jibunAddress;
      detailAddress=req.body.detailAddress;
      name=req.body.name;
      phone1=req.body.phone1;
      phone2=req.body.phone2;
      phone3=req.body.phone3;
      memo=req.body.memo;
    }else{
      zonecode=req.body.new_zonecode;
      roadAddress=req.body.new_roadAddress;
      jibunAddress=req.body.new_jibunAddress;
      detailAddress=req.body.new_detailAddress;
      name=req.body.new_name;
      phone1=req.body.new_phone1;
      phone2=req.body.new_phone2;
      phone3=req.body.new_phone3;
      memo=req.body.new_memo;
    }
    var phone=phone1+"-"+phone2+"-"+phone3

    const order = await db.any("insert into orders (o_u_id,name,zonecode,roadAddress,jibunAddress,detailAddress,memo,phone,email,total,discount,usepoint,delivery,amount,payment) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)",
    [u_id,name,zonecode,roadAddress,jibunAddress,detailAddress,memo,phone,email,total,input_discount,usePoint,input_deliveryCost,input_total,payment]);

    const o_id =await db.any("select max(o_id) as o_id from orders where o_u_id=$1",u_id);
    console.log("o_id:"+o_id[0].o_id);

    for(var i=0;i < g_id.length;i++){
      var orders_goods=await db.any("insert into orders_goods (o_id,g_id,quantity) values($1,$2,$3)",[o_id[0].o_id,g_id[i],quantity[i]]);
    }
    var add_point =(parseInt(input_total)-parseInt(input_discount))*0.01;console.log("1");
    var input_point = parseInt(point)-parseInt(usePoint)+parseInt(add_point);console.log("2");
    const charge = await db.any("update users set point=$1 where u_id=$2",[input_point,u_id]);
    console.log("3");
    const addPoint = await db.any("insert into points (p_o_id,point,contents,p_u_id) values ($1,$2,'상품 구매',$3)",[o_id[0].o_id,parseInt(add_point),u_id]);
console.log("4");
    var user_info = new Object();
    user_info.name=req.body.info_name;
    user_info.phone=req.body.info_phone1+"-"+req.body.info_phone2+"-"+req.body.info_phone3;
    user_info.email=email;
    console.log("5");
    var receiver = new Object();
    receiver.name = name;
    receiver.phone = phone;
    receiver.address = roadAddress+" "+detailAddress+"("+jibunAddress+")";
    receiver.memo = memo;
    console.log("6");
    var pay = req.body.pay;
    var order_info = new Object();
    order_info.pay=pay;
    order_info.usePoint=usePoint;
    order_info.total = total;
    console.log("7");
    var goods = new Array();
    for(var i=0;i < g_id.length;i++){
      var item = await db.one("select * from goods where g_id = $1",g_id[i]);
      item.quantity = quantity[i];
      item.total = parseInt(item.price)*parseInt(quantity[i]);

      goods.push(item);
    }
    console.log("8");
    console.log(c_id.length);
    console.log(c_id);
    
    if(c_id.length){
      for(var i=0;i < c_id.length;i++){
        var deleteCart = await db.any("delete from carts where c_id=$1",c_id[i]);
        
      }
    }
    console.log("9");
    res.render('orderOk',{'session':req.session.user,'user_info':user_info,'receiver':receiver,'order_info':order_info,'goods':goods});
  } catch (e) {
    console.log(e+"post order");
  }
});

router.get('/orderOk', function(req, res, next) {
  console.log(req.session.user);
  if(!req.session.user){
    res.render('orderOk', {session:false});
  }else{
    res.render('orderOk', { session:req.session.user });
  }
});


router.get('/cart',async function(req, res, next){
  console.log(req.session.user);
  const user = await db.any("select * from users where u_id=$1",req.session.user.u_id);
  const carts = await db.any("select * from carts left join goods on carts.c_g_id=goods.g_id where c_u_id=$1 order by c_id asc",req.session.user.u_id);
  const count = await db.any("select count(*) from carts where c_u_id=$1",req.session.user.u_id);
  console.log(carts);
  if(!req.session.user){
    res.render('cart', {"session":false});
  }else{
    res.render('cart', { "session":req.session.user, "user":user[0],"carts":carts,'count':count[0].count});
  }
});

router.post('/cart', async function(req, res, next){
  try {
    if(!req.session.user){
      res.json({"result":false});
    }else{
      const g_id = req.body.g_id;
      const quan = req.body.quan;
      const u_id = req.session.user.u_id;
      console.log("g_id:"+g_id+"\n"+"quan:"+quan+"\n"+"u_id:"+u_id);
  
      const cart = await db.any("insert into carts(c_u_id,c_g_id,quantity) values($1,$2,$3)",[u_id,g_id,quan]);
      res.json({"result":true});
    }
  } catch (e) {
    console.log(e+"\n"+"-------post cart-------")
  }
  
  
});
router.post('/deleteCart', async function(req, res, next){
  try {
    const c_id =req.body.c_id;
    const deleteCart= await db.any("delete from carts where c_id=$1",c_id);
    const carts = await db.any("select * from carts left join goods on carts.c_g_id=goods.g_id where c_u_id=$1 order by c_id asc",req.session.user.u_id);
    res.json({"carts":carts});
  } catch (e) {
    console.log(e+"\n"+"-------deleteCart-------");
  }
});



router.get('/garden',async function(req, res, next) {
  try {
    const gardens = await db.any("select * from gardens order by gr_id");
    const count = await db.any("select count(*) from gardens");
    console.log(gardens);
    console.log(count[0].count);
    console.log(req.session.user);
    if(!req.session.user){
      res.render('garden', {"session":false, "gardens":gardens , "count":count[0].count});
    }else{
      res.render('garden', { "session":req.session.user,"gardens":gardens,"count": count[0].count });
    }
  } catch (e) {
    console.log(e);
  }
});

router.get('/garden_detail/:gr_id',async function(req, res, next) {
  try {
    const gr_id = req.params.gr_id;
    const garden = await db.any("select * from gardens where gr_id=$1",gr_id);
    console.log(garden);
    console.log(req.session.user);
    if(!req.session.user){
      res.render('garden_detail', {"session":false, "garden":garden[0] });
    }else{
      res.render('garden_detail', { "session":req.session.user,"garden":garden[0] });
    }
  } catch (e) {
    console.log(e);
  }
});


router.get('/map', function(req, res, next) {
  console.log(req.session.user);
  if(!req.session.user){
    res.render('map', {session:false});
  }else{
    res.render('map', { session:req.session.user });
  }
});


router.post('/search', async function(req, res, next){
  try {
    console.log(req.session.user);
    const search= req.body.search;
    console.log(search);
    const result=await db.any("select * from goods where name like $1",["%"+search+"%"]);
    console.log(result);
    if(!req.session.user){
      res.render('search', {"session":false ,"result":result});
    }else{
      res.render('search', { "session":req.session.user , "result": result });
    }
  } catch (e) {
    console.log(e+"search");
  }
});

router.get('/calender',async function(req, res, next) {
  try {
    console.log(req.session.user);
    const goods = await db.any("select * from goods where category=1 order by kind, g_id");
    if(!req.session.user){
      res.render('calender', {"session":false,"goods":goods});
    }else{
      res.render('calender', { "session":req.session.user,"goods":goods });
    }
    
  } catch (e) {
    console.log("\n"+"-----get calender-----");
  }
});


router.get('/recipe', async function(req, res, next) {
  try {
    console.log(req.session.user);
    const recipe = await db.any("select * from recipes order by r_id");
    
    var marArray = new Array();

    for(var i=0; i < recipe.length; i++){
      var marterials = recipe[i].marterials;
      var marSplit = marterials.split(',');
      var marObject="";
      for(var j=0;j<marSplit.length;j++){
        if(j!=0){
          marObject+=", "
        }
        var result = await db.one("select * from goods where g_id=$1",marSplit[j]);
        
        marObject+=result.printname;
        console.log(marObject);
      }
      marArray.push(marObject);
    }
    console.log(marArray);
    if(!req.session.user){
      res.render('recipe', {session:false, "recipe": recipe,"marArray":marArray});
    }else{
      res.render('recipe', { session:req.session.user,"recipe": recipe,"marArray":marArray });
    }
    
  } catch (e) {
    console.log(e+"recipe");
  }
});
router.get('/recipe/:r_id',async function(req, res, next) {
  try {
    var r_id= req.params.r_id;
    console.log(req.session.user);

    const recipe = await db.one("select * from recipes where r_id=$1",r_id);
    
    console.log(recipe.lists);
    console.log(typeof(recipe.lists));
    
    var marArray = new Array();
    var marterials = recipe.marterials;
    var marSplit = marterials.split(',');
    console.log(marSplit);

    for(var i=0;i<marSplit.length;i++){
      var marObject = new Object();
      var result = await db.one("select * from goods where g_id=$1",marSplit[i]);
      
      marObject.g_id=result.g_id;
      marObject.name=result.name;
      marObject.price = result.price;

      marArray.push(marObject);
    }
    console.log(recipe);
    console.log(marArray);
  
    if(!req.session.user){
      res.render('recipe_detail', {session:false,"recipe":recipe,"marterials":marArray});
    }else{
      res.render('recipe_detail', { session:req.session.user,"recipe":recipe,"marterials":marArray});
    }
    
  } catch (e) {
    console.log(e+"recipe_detail");
    
  }
  
});

module.exports = router;
