import multer from 'multer';

const storage = multer.memoryStorage();

const profilephotoUpload = multer({storage}).single('profilephoto');

const resumeUpload = multer({storage}).single('resume');

const documentsUpload = multer({storage}).array('documents', 5); // Limit to 5 documents

export { profilephotoUpload, resumeUpload, documentsUpload };