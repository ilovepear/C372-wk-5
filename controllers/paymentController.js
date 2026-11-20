// Lesson 5/6 mock payment-preparation exercises: these routes do NOT collect money.
const catalogue=require('../data/mockServices');
const {positiveId}=require('../helpers/validation');
const preparePayment=(req,res)=>{
  const id=positiveId(req.params.serviceId);
  const service=catalogue.find(item=>item.id===id);
  if(!service)return res.status(404).json({error:'Service not found'});
  res.json({serviceId:service.id,serviceName:service.name,amount:service.price,currency:'sgd',status:'READY_FOR_PAYMENT'});
};
const createMockPayment=(req,res)=>{
  const id=positiveId(req.params.serviceId);
  const service=catalogue.find(item=>item.id===id);
  if(!service)return res.status(404).json({error:'Service not found'});
  const statuses=['APPROVED','DECLINED','PENDING'];
  const paymentStatus=statuses.includes(req.body?.testStatus)?req.body.testStatus:'PENDING';
  res.json({serviceId:service.id,providerPaymentId:'mock_'+Date.now(),merchantReference:'SERVICE-'+id,
    paymentStatus,bookingStatus:{APPROVED:'CONFIRMED',DECLINED:'PAYMENT_FAILED',PENDING:'AWAITING_PAYMENT'}[paymentStatus],
    simulated:true});
};
module.exports={preparePayment,createMockPayment};
