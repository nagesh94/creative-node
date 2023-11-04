const User=require('../models/userModel');
const jwt = require('jsonwebtoken')
const catchAsync=require('../utils/catchAsync')
const appError = require('../utils/appError')
const excel = require('excel4node')
const pdfkit = require('pdfkit')
const fs = require('fs')
const fss = require('fs').promises
const { promisify } = require('util');
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const multer = require('multer');

const unlink = promisify(fs.unlink); 

const multerStorage=multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'userimages')
    },
    filename: (req,file,cb)=>{
        const ext=file.mimetype.split('/')[1]
        const uniqueFilename = uuidv4();
        cb(null,`user-${uniqueFilename}.${ext}`)
    }
})

const upload=multer({
    storage:multerStorage
})

exports.uploadUserImage=upload.single('image')


const wb = new excel.Workbook(); 
const ws = wb.addWorksheet('Userlist')



const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET,
        {
            expiresIn: process.env.TOKEN_EXPIRE
        })
}

async function excelConverter(users,res){
    const headingColumnNames = [
        'Name',
        'Email',
       
      ];
      
      let headingColumnIndex = 1
      headingColumnNames.forEach((heading) => {
        ws.cell(1, headingColumnIndex++).string(heading) 
      })
      let rowIndex = 2
      const userPropertiesToExport = ['name', 'email']

      users.forEach((user) => {
        let columnIndex = 1;
        userPropertiesToExport.forEach((property) => {
          ws.cell(rowIndex, columnIndex++).string(user[property]);
        });
        rowIndex++;
      })

      wb.write('result.xlsx',res)
}

async function pdfConverter(user,res,id){
    try {
        const doc=new pdfkit()
    
    // const filename = `user_details${id}.pdf`
    // const pdfDirectory = path.join(__dirname, '../file'); 
    // const pdfPath = path.join(pdfDirectory, filename);

    
    
    
        // fs.mkdirSync(pdfDirectory, { recursive: true });
      
        
        doc.pipe(fs.createWriteStream("output.pdf"));
        doc.text(`User Details`);
        doc.text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        const imageDirectory = path.join(__dirname, '../userimages');
        const imageFilePath = path.join(imageDirectory, user.image);
        doc.image(imageFilePath, { fit: [250, 250], align: 'center', valign: 'center' });
        doc.end();
        
    
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=output.pdf`);
      
        
                    const pdfStream = fs.createReadStream("output.pdf");
                    pdfStream.pipe(res);
                    pdfStream.on('end', async () => {
                        // Cleanup the generated PDF file asynchronously
                        try {
                          await unlink('output.pdf');
                          console.log('PDF file deleted');
                        } catch (err) {
                          console.error('Error deleting PDF file:', err);
                        }
                      });
        
        
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }


}

exports.getUsers=catchAsync(async (req,res,next)=>{
    const result=await User.find({}, { name:1,email:1 })
    // console.log(result)
    let users=[...result]
    excelConverter(users,res)
  
 
})

exports.getSingleUser=catchAsync(async (req,res,next)=>{
    const id=req.params.id
    const user=await User.findById(id)
    if(!user){
        return next(new appError("user not found",404))
    }

    pdfConverter(user,res,id)
   

    


})

exports.register=catchAsync(
    async (req,res,next)=>{
        let imagename=''
        if(req.file) { imagename=req.file.filename}
        let data={
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            image:imagename,
        }
    
        const result=await User.create(data)

        const token = createToken(result._id)

        res.status(200).json({
            status:"success",
            token,
            result

        })
    }
)
exports.login=catchAsync(
    async (req,res,next) => {
        const {password,email} = req.body
        if(!password || !email) {
            return next(new appError("please provide email and password",400))
        }

        const user=await User.findOne({email}).select("+password")
        if(!user || !await user.passcheck(password,user.password) ){
            return next(new appError("email or password is incorrect",400))
        }

        const token=createToken(user._id)
        res.status(200).json({
            status:"success",
            token
        })
    }
)

exports.authorization=catchAsync(async (req,res,next)=>{
    if (!req.headers.authorization) {
        return next(new appError("token does not exist", 401))
    }

    
    const token = req.headers.authorization.split(' ')[1]

    const decoded = jwt.verify(token, process.env.SECRET)

    const user = await User.findById(decoded.id).select("+password")
    if (!user) {
        return next(new appError("user associated with this token does not exist anymore", 401))
    }

    req.currentUser = user;
    

    next()
})