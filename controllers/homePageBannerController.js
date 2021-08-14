const { HomePageBanner } = require('../_helper/db');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

module.exports = {
    createHPBanner: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const reqFiles = req.files;

            let image = '';

            if (reqFiles.length) {
                image = {};
                const name = reqFiles[0].originalname;
                image.file_name = name;
                image.file_type = name.substr(name.lastIndexOf("."));
                image.file = reqFiles[0].filename;
                image.file_size = reqFiles[0].size;

                var filePath = path.join(__dirname, '../public/thumbnail/');

                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath);
                }

                const fileUrl = filePath + reqFiles[0].filename;

                sharp(reqFiles[0].path).resize(300, 200).toFile(fileUrl, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('FILEEEEEEEE', fileUrl);
                });

            } else {
                return res.send({ status: false, message: 'Image not found' });
            }

            reqBody.image = image;
            const bannerModel = new HomePageBanner(reqBody);

            const created = await bannerModel.save();
            return res.send({ status: true, data: created._id, message: 'File created successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    updateHPBanner: async (req, res, next) => {
        try {
            const reqBody = req.body;
            const reqFiles = req.files;

            const Id = reqBody._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            if (reqFiles.length) {
                let image = {};
                const name = reqFiles[0].originalname;
                image.file_name = name;
                image.file_type = name.substr(name.lastIndexOf("."));
                image.file = reqFiles[0].filename;
                image.file_size = reqFiles[0].size;

                reqBody.image = image;


                var filePath = path.join(__dirname, '../public/thumbnail/');

                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath);
                }

                const fileUrl = filePath + reqFiles[0].filename;

                sharp(reqFiles[0].path).resize(300, 200).toFile(fileUrl, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('FILEEEEEEEE', fileUrl);
                });
            }

            await HomePageBanner.findByIdAndUpdate(Id, reqBody).lean().exec();

            return res.send({ status: true, data: {}, message: 'Info updated successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getHPBanner: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const banner = await HomePageBanner.findById(Id).lean().exec();

            if (!banner) {
                return res.send({ status: false, message: 'Banner not fount for this id' });
            }

            // const baseUrl = (req.protocol + '://' + req.get('host') + '/');
            // banner.image ? (banner.image.file = (baseUrl + banner.image.file)) : '';
            banner.image ? (banner.thumbnailImage = ('thumbnail/' + banner.image.file)) : '';

            return res.send({ status: true, data: banner, message: 'Home Page Banner get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    getAllHPBanner: async (req, res, next) => {
        try {

            const reqBody = req.body;
            const Limit = reqBody.limit ? parseInt(reqBody.limit) : 10;
            const PageNo = reqBody.page ? parseInt(reqBody.page) : 0;

            const Allbanner = await HomePageBanner.find().sort({ updated_at: -1 }).skip(Limit * PageNo).limit(Limit).lean().exec();
            const count = await HomePageBanner.count();

            const baseUrl = (req.protocol + '://' + req.get('host') + '/');

            Allbanner.forEach(E => {
                // E.image ? (E.image.file = (E.image.file)) : '';
                E.image ? (E.thumbnailImage = ('thumbnail/' + E.image.file)) : '';
            });

            return res.send({ status: true, data: Allbanner, count: count, message: 'All Home Page Banner get successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

    deleteHPBanner: async (req, res, next) => {
        try {
            const reqQuery = req.query;
            const Id = reqQuery._id;

            if (!Id) {
                return res.send({ status: false, message: 'Id is required' });
            }

            const deleted = await HomePageBanner.findByIdAndDelete(Id).lean().exec();

            if (!deleted) {
                return res.send({ status: false, message: 'Home Page Banner not found' });
            }

            return res.send({ status: true, data: {}, message: 'Home Page Banner deleted successfully' });

        } catch (error) {
            return res.send({ status: false, message: error.message });
        }
    },

}
