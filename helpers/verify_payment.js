module.exports =   (detials) => {
    return new Promise((resolve, reject) => {
      let crypto
      try {
        crypto = require('crypto')
      } catch (err) {
        console.error('crypto support is disabled!')
      }
     
      const hmac = crypto.createHmac('sha256', 'yixVolFFESVi2d0CV74jCko3')
        .update(detials.payment.razorpay_order_id + '|' + detials.payment.razorpay_payment_id)
        .digest('hex')
      // eslint-disable-next-line eqeqeq
      if (hmac == detials.payment.razorpay_signature) {
        resolve()
      } else {
        const err = 'payment failure'
        reject(err)
      }
    })
  }