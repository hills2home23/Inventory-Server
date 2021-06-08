const catchAsync = require("./../utils/catchAsync");
const nodemailer = require('nodemailer');
const sendgridTransport = require("nodemailer-sendgrid-transport");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fs = require("fs");
const PDFDocument = require("pdfkit");


function createInvoice(invoice,path) {
  let doc = new PDFDocument({ size: "A4", margin: 40 });

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}


function generateHeader(doc) {
    doc
      .image("home-logo.png", 40, 65, { width: 50 })
      .fontSize(18)
      .font('Helvetica-Bold')
      .text("TAX INVOICE", 10, 50, { align: "center" },{ continued: true })
      .underline( 220, 52,doc.widthOfString('TAX INVOICE'),doc.currentLineHeight(), { align: "center" })
      .fontSize(12)
      .text("Hills2Home Pvt. Ltd.", 10, 75, { align: "center" },{ continued: true })
      .text("C 204, First Floor, Geeta Complex, Indira Nagar, Dehradun 248171", 10,90, { align: "center" },{ continued: true })
      .text("Mob No. 7017439891", 10, 105, { align: "center" },{ continued: true })
      .text("Email id: info@hills2home.com", 10, 120, { align: "center" },{ continued: true })
      .text("GSTIN: 05AAECH2314R1ZH", 10, 135, { align: "center" },{ continued: true })
      .moveDown();
  }
  
function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      50,
      770,
      { align: "center", width: 500 }
    );
}

function generateCustomerInformation(doc, invoice) {
  const shipping = invoice.shipping;

  doc
  .text("To:", 50, 200)
  .text("Company Name: ", 50, 220)
  .text("Invoice No.", 380, 200)
  .text("Invoice Date.", 380, 220)
    .moveDown();
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 150, y)
    .text(c3, 280, y, { width: 90, align: "right" })
    .text(c4, 370, y, { width: 90, align: "right" })
    .text(c5, 0, y, { align: "right" });
}

function generateInvoiceTable(doc, invoice) {
    let i,
      invoiceTableTop = 280;
      invoiceTablebottom = 280+(invoice.items.length*30);
      doc
      .fontSize(10)
      .text("S No.", 50, 280)
      .text("Description of Goods", 100, 280)
      .text("HSN/SAC", 230, 280)
      .text("Quantity", 307, 280)
      .text("Price", 380, 280)
      .text("Per", 450, 280)
      .text("Amount", 500, 280)
    
    for (i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
        
      //generateTableRow(
      //  doc,
      //  position,
      //  i+1,
      //  item.item,
      //  item.description,
      //  item.amount / item.quantity,
      //  item.quantity,
      //  item.amount,
      //  i+1
      //);
      doc
      .text("Company's Seal", 120, invoiceTablebottom)
      .text("For Hills2Home Pvt. Ltd.", 340, invoiceTablebottom)
    }
  }


  exports.sendInvoice = catchAsync(async (req, res, next) => {
    console.log(req.body);
    createInvoice(req.body,"invoice.pdf");
    let mailTransporter = nodemailer.createTransport(
      sendgridTransport({
        auth: {
          api_key:process.env.SENDGRID_API_KEY,
        },
      })
    );
    const emailData = {
      from: process.env.ADMIN_EMAIL,
      fromname: 'Hills2Home',
      to: req.user.email,
      subject: `An Attached File`,
      text: 'Check out this attached pdf file',
      attachments: [{
        filename: 'invoice.pdf',
        path: 'C:/home/akansha/Desktop/hills2homeserver/invoice.pdf',
        contentType: 'application/pdf'
      }],
      function(err, info) {
        if (err) {
          console.error(err);
        } else {
          console.log(info);
        }
      }
    };
    try {
      await mailTransporter.sendMail(emailData);
      res.status(200).json({
        status: "success",
        message: "Order Successfully created ",
      });
    } catch (err) {
      console.log(err);
      return next(
        new AppError("Couldn't Sent Mail"),
        500
      );
    }
    next();
  });



//  const invoice = {
//    shipping: {
//      name: "John Doe",
//      address: "1234 Main Street",
//      city: "San Francisco",
//      state: "CA",
//      country: "US",
//      postal_code: 94111
//    },
//    items: [
//      {
//        item: "TC 100",
//        description: "Toner Cartridge",
//        quantity: 2,
//        amount: 6000
//      },
//      {
//        item: "TC 100",
//        description: "Toner Cartridge",
//        quantity: 2,
//        amount: 6000
//      },
//      {
//        item: "USB_EXT",
//        description: "USB Cable Extender",
//        quantity: 1,
//        amount: 2000
//      }
//    ],
//    subtotal: 8000,
//    paid: 0,
//    invoice_nr: 1234
//  };
//  
//  createInvoice(invoice,"invoice.pdf");
