require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Location = require('../models/Location');
const User = require('../models/User');

const categories = [
  { name: 'Road & Infrastructure', description: 'Potholes, broken roads, damaged bridges', icon: 'road', color: '#e74c3c' },
  { name: 'Water & Drainage', description: 'Waterlogging, broken pipes, drainage issues', icon: 'water', color: '#3498db' },
  { name: 'Electricity', description: 'Power outages, damaged poles, illegal connections', icon: 'bolt', color: '#f39c12' },
  { name: 'Waste Management', description: 'Garbage accumulation, missed collections', icon: 'trash', color: '#27ae60' },
  { name: 'Public Safety', description: 'Broken streetlights, unsafe areas, crime', icon: 'shield', color: '#9b59b6' },
  { name: 'Environment', description: 'Pollution, deforestation, illegal dumping', icon: 'leaf', color: '#2ecc71' },
  { name: 'Education', description: 'School conditions, teacher shortages', icon: 'book', color: '#1abc9c' },
  { name: 'Healthcare', description: 'Hospital conditions, medicine shortages', icon: 'medical', color: '#e91e63' },
  { name: 'Public Transport', description: 'Bus conditions, route issues, fare disputes', icon: 'bus', color: '#ff9800' },
  { name: 'Other', description: 'Other public issues', icon: 'other', color: '#95a5a6' }
];

const divisions = [
  { name: 'Dhaka', districts: [
    { name: 'Dhaka', upazilas: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar'] },
    { name: 'Faridpur', upazilas: ['Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'] },
    { name: 'Gazipur', upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'] },
    { name: 'Gopalganj', upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'] },
    { name: 'Kishoreganj', upazilas: ['Austagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain', 'Nikli', 'Pakundia', 'Kishoreganj Sadar', 'Tarail'] },
    { name: 'Madaripur', upazilas: ['Madaripur Sadar', 'Kalkini', 'Dasar', 'Rajoir', 'Shibchar'] },
    { name: 'Manikganj', upazilas: ['Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia', 'Shivalaya', 'Singair'] },
    { name: 'Munshiganj', upazilas: ['Gazaria', 'Lohajang', 'Munshiganj Sadar', 'Sirajdikhan', 'Sreenagar', 'Tongibari'] },
    { name: 'Narayanganj', upazilas: ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'] },
    { name: 'Narsingdi', upazilas: ['Belabo', 'Monohardi', 'Narsingdi Sadar', 'Palash', 'Raipura', 'Shibpur'] },
    { name: 'Rajbari', upazilas: ['Baliakandi', 'Goalandaghat', 'Kalukhali', 'Pangsha', 'Rajbari Sadar'] },
    { name: 'Shariatpur', upazilas: ['Bhedarganj', 'Damudya', 'Gosairhat', 'Jajira', 'Naria', 'Shariatpur Sadar'] },
    { name: 'Tangail', upazilas: ['Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Tangail Sadar'] }
  ]},
  { name: 'Chittagong', districts: [
    { name: 'Bandarban', upazilas: ['Bandarban Sadar', 'Thanchi', 'Ruma', 'Lama', 'Alikadam', 'Naikhongchhari', 'Rowangchhari'] },
    { name: 'Brahmanbaria', upazilas: ['Brahmanbaria Sadar', 'Ashuganj', 'Nasirnagar', 'Nabinagar', 'Sarail', 'Kasba', 'Akhaura', 'Bancharampur', 'Bijoynagar'] },
    { name: 'Chandpur', upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab North', 'Matlab South', 'Shahrasti'] },
    { name: 'Chittagong', upazilas: ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sitakunda', 'Chittagong Sadar'] },
    { name: 'Cox\'s Bazar', upazilas: ['Cox\'s Bazar Sadar', 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Ramu', 'Teknaf', 'Ukhia', 'Pekua'] },
    { name: 'Cumilla', upazilas: ['Cumilla Adarsha Sadar', 'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Lalmai', 'Meghna', 'Monoharganj', 'Muradnagar', 'Nangalkot', 'Titas'] },
    { name: 'Feni', upazilas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Sonagazi', 'Fulgazi'] },
    { name: 'Khagrachhari', upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh', 'Guimara'] },
    { name: 'Lakshmipur', upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'] },
    { name: 'Noakhali', upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Kabirhat', 'Senbagh', 'Sonaimuri', 'Subarnachar'] },
    { name: 'Rangamati', upazilas: ['Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Kawkhali', 'Belaichhari', 'Kaptai', 'Juraichhari', 'Langadu', 'Naniarchar', 'Rajasthali'] }
  ]},
  { name: 'Rajshahi', districts: [
    { name: 'Bogura', upazilas: ['Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatala'] },
    { name: 'Joypurhat', upazilas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'] },
    { name: 'Naogaon', upazilas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mahadebpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'] },
    { name: 'Natore', upazilas: ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga'] },
    { name: 'Chapainawabganj', upazilas: ['Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'] },
    { name: 'Pabna', upazilas: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'] },
    { name: 'Rajshahi', upazilas: ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore', 'Rajshahi Sadar'] },
    { name: 'Sirajganj', upazilas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'] }
  ]},
  { name: 'Khulna', districts: [
    { name: 'Bagerhat', upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'] },
    { name: 'Chuadanga', upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'] },
    { name: 'Jashore', upazilas: ['Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'] },
    { name: 'Jhenaidah', upazilas: ['Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'] },
    { name: 'Khulna', upazilas: ['Batiaghata', 'Dacope', 'Dighalia', 'Dumuria', 'Paikgachha', 'Phultala', 'Rupsa', 'Terokhada', 'Koyra'] },
    { name: 'Kushtia', upazilas: ['Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur'] },
    { name: 'Magura', upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'] },
    { name: 'Meherpur', upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'] },
    { name: 'Narail', upazilas: ['Narail Sadar', 'Kalia', 'Lohagara'] },
    { name: 'Satkhira', upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'] }
  ]},
  { name: 'Barisal', districts: [
    { name: 'Barguna', upazilas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'] },
    { name: 'Barisal', upazilas: ['Barisal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gournadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur'] },
    { name: 'Bhola', upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'] },
    { name: 'Jhalokati', upazilas: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'] },
    { name: 'Patuakhali', upazilas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali'] },
    { name: 'Pirojpur', upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Zianagar'] }
  ]},
  { name: 'Sylhet', districts: [
    { name: 'Habiganj', upazilas: ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniachong', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Shayestaganj'] },
    { name: 'Moulvibazar', upazilas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'] },
    { name: 'Sunamganj', upazilas: ['Sunamganj Sadar', 'Bishwambarpur', 'Chhatak', 'Derai', 'Dharampasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Shalla', 'Tahirpur', 'Dakshin Sunamganj', 'Madhyanagar'] },
    { name: 'Sylhet', upazilas: ['Sylhet Sadar', 'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Zakiganj', 'Dakshin Surma', 'Osmaninagar'] }
  ]},
  { name: 'Rangpur', districts: [
    { name: 'Dinajpur', upazilas: ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'] },
    { name: 'Gaibandha', upazilas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj'] },
    { name: 'Kurigram', upazilas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Phulbari', 'Nageshwari', 'Rajarhat', 'Raomari', 'Ulipur'] },
    { name: 'Lalmonirhat', upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'] },
    { name: 'Nilphamari', upazilas: ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur'] },
    { name: 'Panchagarh', upazilas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'] },
    { name: 'Rangpur', upazilas: ['Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'] },
    { name: 'Thakurgaon', upazilas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'] }
  ]},
  { name: 'Mymensingh', districts: [
    { name: 'Jamalpur', upazilas: ['Jamalpur Sadar', 'Baksiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari'] },
    { name: 'Mymensingh', upazilas: ['Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal', 'Tarakanda'] },
    { name: 'Netrokona', upazilas: ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendua', 'Madan', 'Mohanganj', 'Purbadhala'] },
    { name: 'Sherpur', upazilas: ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'] }
  ]}
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixmybd');
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Location.deleteMany({});
    await User.deleteMany({});

    await Category.insertMany(categories);
    console.log('Categories seeded');

    const savedDivisions = [];
    for (const div of divisions) {
      const divDoc = await new Location({ name: div.name, type: 'division' }).save();
      savedDivisions.push({ ...div, _id: divDoc._id });

      for (const dist of div.districts) {
        const distDoc = await new Location({ name: dist.name, type: 'district', parent: divDoc._id }).save();

        for (const upa of dist.upazilas) {
          await new Location({ name: upa, type: 'upazila', parent: distDoc._id }).save();
        }
      }
    }
    console.log('Locations seeded');

    await User.create({
      name: 'Admin',
      email: 'admin@fixmybd.com',
      password: 'admin123',
      role: 'admin',
      phone: '01700000000'
    });
    console.log('Admin user created: admin@fixmybd.com / admin123');

    await User.create({
      name: 'Road Authority',
      email: 'road@fixmybd.com',
      password: 'auth123',
      role: 'authority',
      authorityDept: 'Road & Infrastructure',
      phone: '01711111111'
    });
    console.log('Authority user created: road@fixmybd.com / auth123');

    await User.create({
      name: 'Test Citizen',
      email: 'citizen@fixmybd.com',
      password: 'citizen123',
      role: 'citizen',
      phone: '01722222222'
    });
    console.log('Citizen user created: citizen@fixmybd.com / citizen123');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
