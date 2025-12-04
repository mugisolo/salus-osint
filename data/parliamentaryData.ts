
import { ParliamentaryCandidate, ConstituencyProfile, ElectionTrend, CandidatePastResult, SocialMediaPoll, OSINTBackground, CampaignStrategy, NewsItem, PartyResult } from '../types';

// Coordinate Mapping for Districts/Major Towns to place constituencies roughly
const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Mbale': [1.0782, 34.1765], 'Sironko': [1.2315, 34.2477], 'Manafwa': [0.9908, 34.2975],
  'Namisindwa': [0.9800, 34.3600], 'Tororo': [0.6928, 34.1809], 'Bulambuli': [1.1667, 34.4000],
  'Jinja': [0.4479, 33.2026], 'Bugweri': [0.5667, 33.7500], 'Iganga': [0.6106, 33.4672],
  'Kaliro': [1.0833, 33.5000], 'Luuka': [0.7333, 33.3333], 'Kagoma': [0.5833, 33.1667],
  'Apac': [1.9833, 32.5333], 'Amolatar': [1.6333, 32.8333], 'Oyam': [2.3833, 32.5000],
  'Kwania': [2.0833, 32.7333], 'Otuke': [2.5000, 33.5000], 'Ajuri': [2.3000, 33.3000], 'Alebtong': [2.3000, 33.3000],
  'Dokolo': [1.9167, 33.1667], 'Gulu': [2.7724, 32.2881], 'Omoro': [2.7000, 32.5000],
  'Aruu': [2.8333, 33.0833], 'Pader': [2.8333, 33.0833], 'Kitgum': [3.2783, 32.8867],
  'Arua': [3.0303, 30.9073], 'Obongi': [3.5000, 31.5000], 'Moyo': [3.6527, 31.7281],
  'Nebbi': [2.4783, 31.0889], 'Yumbe': [3.4653, 31.2469], 'Adjumani': [3.3667, 31.7833],
  'Kabale': [-1.2486, 29.9880], 'Rubanda': [-1.1833, 29.8500], 'Kisoro': [-1.2833, 29.6833],
  'Kanungu': [-0.9500, 29.7833], 'Rukiga': [-1.1000, 30.0333], 'Fort Portal': [0.6545, 30.2744],
  'Kagadi': [0.9333, 30.8167], 'Kasese': [0.1865, 30.0788], 'Kibaale': [0.7833, 31.0667],
  'Kakumiro': [0.7833, 31.2833], 'Buliisa': [2.0000, 31.4167], 'Kikuube': [1.3333, 31.1667],
  'Hoima': [1.4331, 31.3524], 'Masindi': [1.6833, 31.7167],
  'Luweero': [0.8333, 32.5000], 'Katikamu': [0.7500, 32.5000], 'Mukono': [0.3533, 32.7517],
  'Nakifuma': [0.5667, 32.8000], 'Wakiso': [0.3953, 32.4807], 'Entebbe': [0.0512, 32.4637],
  'Nansana': [0.3667, 32.5333], 'Makindye': [0.2333, 32.5833], 'Rubaga': [0.3000, 32.5500],
  'Kawempe': [0.3833, 32.5667], 'Nakawa': [0.3333, 32.6167], 'Busiro': [0.2000, 32.4000],
  'Kamuli': [0.9167, 33.1167], 'Buzaaya': [0.9500, 33.0500], 'Serere': [1.5000, 33.5500],
  'Kasilo': [1.4000, 33.4500], 'Pingire': [1.3500, 33.3500], 'Soroti': [1.7146, 33.6111],
  'Kumi': [1.4861, 33.9311]
};

const RAW_CANDIDATES: Omit<ParliamentaryCandidate, 'sentimentScore' | 'projectedVoteShare' | 'mentions' | 'coordinates'>[] = [
  // --- EASTERN REGION ---
  // Mbale City
  { id: 'p1', name: 'Lydia Wanyoto', constituency: 'Woman MP Mbale City', party: 'NRM', category: 'Woman MP' },
  { id: 'p2', name: 'Connie Galiwango', constituency: 'Woman MP Mbale City', party: 'Independent', category: 'Woman MP' },
  { id: 'p3', name: 'Sarah Wasagali', constituency: 'Woman MP Mbale City', party: 'Independent', category: 'Woman MP' },
  { id: 'p4', name: 'Anthony Wasukira', constituency: 'Industrial City Division MP', party: 'Independent', category: 'Constituency' },
  { id: 'p5', name: 'Seth Wambede', constituency: 'Northern City Division MP', party: 'Independent', category: 'Constituency' },
  { id: 'p6', name: 'Paul Wanyoto Mugoya', constituency: 'Northern City Division MP', party: 'Independent', category: 'Constituency' },
  { id: 'p20', name: 'Umar Nangoli', constituency: 'Northern City Division, Mbale City', party: 'Independent', category: 'Constituency' },
  
  // Bunghokho
  { id: 'p7', name: 'Masaba Mahomound', constituency: 'Bunghokho Central', party: 'NRM', category: 'Constituency' },
  { id: 'p8', name: 'Hussein Wazemba Wachagi', constituency: 'Bunghokho North', party: 'Independent', category: 'Constituency' },
  
  // Sironko
  { id: 'p9', name: 'Asha Nabulo', constituency: 'Woman MP Sironko District', party: 'NRM', category: 'Woman MP' },
  { id: 'p10', name: 'Florence Nambozo', constituency: 'Woman MP Sironko District', party: 'Independent', category: 'Woman MP' },
  
  // Manafwa
  { id: 'p11', name: 'Rose Mutonyi', constituency: 'Woman MP Manafwa District', party: 'Independent', category: 'Woman MP' },
  { id: 'p12', name: 'Annet Musibikha', constituency: 'Woman MP Manafwa District', party: 'NRM', category: 'Woman MP' },
  { id: 'p22', name: 'Irene Mutonyi', constituency: 'Woman MP Manafwa District', party: 'NRM', category: 'Woman MP' },
  { id: 'p17', name: 'Gofrey Wakooli Matembu', constituency: 'Butiru County, Manafwa', party: 'NRM', category: 'Constituency' },
  { id: 'p23', name: 'Fostin Wanikina', constituency: 'Butiru County, Manafwa', party: 'Independent', category: 'Constituency' },
  { id: 'p24', name: 'Kefa Mafumo', constituency: 'Butiru County, Manafwa', party: 'Independent', category: 'Constituency' },

  // Namisindwa
  { id: 'p13', name: 'John Musila', constituency: 'Bubulo East, Namisindwa', party: 'NRM', category: 'Constituency' },
  { id: 'p14', name: 'Wilbroad Nakhabala', constituency: 'Namisindwa County', party: 'NUP', category: 'Constituency' },
  { id: 'p15', name: 'Metrine Nanzala', constituency: 'Namisindwa County', party: 'NRM', category: 'Constituency' },
  { id: 'p16', name: 'Chris Matembu Wataka', constituency: 'Bubulo West, Namisindwa', party: 'Independent', category: 'Constituency' },
  { id: 'p18', name: 'Peace Khalayi', constituency: 'Woman MP Namisindwa District', party: 'Independent', category: 'Woman MP' },
  { id: 'p19', name: 'Sarah Khanakwa', constituency: 'Woman MP Namisindwa District', party: 'Independent', category: 'Woman MP' },

  // Bulambuli
  { id: 'p21', name: 'Irene Muloni', constituency: 'Elgon North County, Bulambuli District', party: 'NRM', category: 'Constituency' },
  { id: 'p45', name: 'Nyasio Mudimi', constituency: 'Elgon County, Bulambuli District', party: 'Independent', category: 'Constituency' },
  { id: 'p46', name: 'Massa Moses', constituency: 'Elgon County, Bulambuli District', party: 'Independent', category: 'Constituency' },
  { id: 'p47', name: 'Jackline Nandudu', constituency: 'Bulambuli Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p48', name: 'Sauda Namataka', constituency: 'Elgon County, Bulambuli District', party: 'Independent', category: 'Constituency' },
  { id: 'p49', name: 'Mesach Kiboma', constituency: 'Elgon County, Bulambuli District', party: 'Independent', category: 'Constituency' },
  { id: 'p50', name: 'Stephen Nagimesi', constituency: 'Elgon County, Bulambuli District', party: 'Independent', category: 'Constituency' },
  { id: 'p51', name: 'Peter Wekesa', constituency: 'Bulambuli County', party: 'Independent', category: 'Constituency' },
  { id: 'p52', name: 'Isaac Katenya', constituency: 'Bulambuli County', party: 'Independent', category: 'Constituency' },
  { id: 'p162', name: 'Sarah Wekomba', constituency: 'Woman MP Bulambuli District', party: 'Independent', category: 'Woman MP' },

  // Tororo
  { id: 'p25', name: 'Robert Onyango Magara', constituency: 'West Budama North East', party: 'FDC', category: 'Constituency' },
  { id: 'p26', name: 'Joshua Ochom Okongo', constituency: 'Tororo North County', party: 'NUP', category: 'Constituency' },
  { id: 'p27', name: 'Ronald Okoth', constituency: 'West Budama Central', party: 'Independent', category: 'Constituency' },
  { id: 'p28', name: 'Joseph Ofwono Ottawa', constituency: 'West Budama North East', party: 'Independent', category: 'Constituency' },
  { id: 'p29', name: 'Ochom Patrick Oguta', constituency: 'Tororo Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p30', name: 'Osinde Jimmy Okongo Owor', constituency: 'West Budama North East', party: 'NRM', category: 'Constituency' },
  { id: 'p31', name: 'Wilson Okachuga', constituency: 'Tororo South County', party: 'Independent', category: 'Constituency' },
  { id: 'p32', name: 'Oketcho Solomon Lony', constituency: 'West Budama South', party: 'Independent', category: 'Constituency' },
  { id: 'p33', name: 'Richard Owere Machika', constituency: 'West Budama North East', party: 'Independent', category: 'Constituency' },
  { id: 'p34', name: 'Annette Nyaketcho', constituency: 'Tororo North County', party: 'Independent', category: 'Constituency' },
  { id: 'p35', name: 'George Oketcho', constituency: 'West Budama South', party: 'FDC', category: 'Constituency' },
  { id: 'p36', name: 'Richard Othieno Okoth', constituency: 'West Budama North', party: 'NRM', category: 'Constituency' },
  { id: 'p37', name: 'Fox Odoi Oywelowo', constituency: 'West Budama North East', party: 'NRM', category: 'Constituency' },
  { id: 'p38', name: 'Henry Okori Okumu', constituency: 'West Budama North', party: 'Independent', category: 'Constituency' },
  { id: 'p39', name: 'Ambassador Phibby Otaala Awere', constituency: 'Tororo District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p40', name: 'Geoffrey Ekanya', constituency: 'Tororo North County', party: 'Independent', category: 'Constituency' },
  { id: 'p41', name: 'Frederick Angura', constituency: 'Tororo South County', party: 'Independent', category: 'Constituency' },
  { id: 'p42', name: 'Sarah Opening Aching', constituency: 'Tororo District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p43', name: 'Annette Mandala Kimbowa', constituency: 'Tororo Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p44', name: 'Simon Nicholas Owino', constituency: 'Tororo North County', party: 'NRM', category: 'Constituency' },

  // Jinja City & District
  { id: 'p53', name: 'Moses Grace Balyeku', constituency: 'Jinja South West City', party: 'NRM', category: 'Constituency' },
  { id: 'p54', name: 'Lazarous Namadu', constituency: 'Jinja South West City', party: 'Independent', category: 'Constituency' },
  { id: 'p55', name: 'Ivan Isiko', constituency: 'Jinja South West City', party: 'Ecological Party', category: 'Constituency' },
  { id: 'p56', name: 'Manjeri Kyebakutika', constituency: 'Jinja City Woman MP', party: 'NUP', category: 'Woman MP' },
  { id: 'p57', name: 'Annet Musika', constituency: 'Jinja City Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p58', name: 'Sarah Lwansasula', constituency: 'Jinja City Woman MP', party: 'NUP', category: 'Woman MP' },
  { id: 'p59', name: 'Paul Mwiru', constituency: 'Jinja South East City', party: 'NUP', category: 'Constituency' },
  { id: 'p60', name: 'Hussein Muyonjo', constituency: 'Jinja North City', party: 'Independent', category: 'Constituency' },
  { id: 'p61', name: 'Ronnie Kakooza', constituency: 'Jinja North City', party: 'Independent', category: 'Constituency' },
  { id: 'p62', name: 'Ronald Isiko', constituency: 'Jinja North City', party: 'Independent', category: 'Constituency' },
  { id: 'p63', name: 'Isaac Imack', constituency: 'Jinja North City', party: 'Independent', category: 'Constituency' },
  { id: 'p64', name: 'Godfrey Kabugo', constituency: 'Jinja North City', party: 'NRM', category: 'Constituency' },
  { id: 'p169', name: 'Monica Namukose Kamagu', constituency: 'Jinja District Woman Seat', party: 'Independent', category: 'Woman MP' },

  // Bugweri
  { id: 'p65', name: 'Sadara Wandera', constituency: 'Bugweri District County', party: 'Independent', category: 'Constituency' },
  { id: 'p66', name: 'Rachel Magoola', constituency: 'Bugweri District Woman Seat', party: 'Independent', category: 'Woman MP' },
  { id: 'p67', name: 'Stella Nankwanga', constituency: 'Bugweri District Woman Seat', party: 'Independent', category: 'Woman MP' },

  // Iganga & Kigulu
  { id: 'p155', name: 'Hajj Swaibu Ojasi', constituency: 'Iganga Municipality', party: 'NRM', category: 'Constituency' },
  { id: 'p156', name: 'Bam Lulenzi', constituency: 'Iganga Municipality', party: 'NUP', category: 'Constituency' },
  { id: 'p157', name: 'Hajj Ismail Badogi', constituency: 'Kigulu North', party: 'Independent', category: 'Constituency' },
  { id: 'p158', name: 'Persis Namuganja', constituency: 'Bukono Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p159', name: 'Emmanuel Maganda Katoko', constituency: 'Bukono Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p166', name: 'Mariam Naigaga', constituency: 'Iganga District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p111', name: 'Patrick Kayemba', constituency: 'Kigulu South Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p112', name: 'Milton Muwuma', constituency: 'Kigulu South Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p113', name: 'Abdulahim Ssebukaire', constituency: 'Kigulu South Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p114', name: 'Andrew Kiiza', constituency: 'Kigulu South Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p115', name: 'Iarn Waiswa', constituency: 'Kigulu South Constituency', party: 'NUP', category: 'Constituency' },
  { id: 'p116', name: 'Sauda Kawuma Alibawo', constituency: 'Iganga Woman MP Seat', party: 'Independent', category: 'Woman MP' },
  { id: 'p117', name: 'Marim Magumba', constituency: 'Iganga Woman MP Seat', party: 'Independent', category: 'Woman MP' },

  // Busiki, Kaliro, Luuka, Kagoma
  { id: 'p160', name: 'Paul Akamba', constituency: 'Busiki Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p161', name: 'Joel Azalwa', constituency: 'Busiki Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p163', name: 'Seduraki Mugoya', constituency: 'Busiki North', party: 'Independent', category: 'Constituency' },
  { id: 'p164', name: 'Yusuf Kwaso', constituency: 'Busiki North', party: 'Independent', category: 'Constituency' },
  { id: 'p165', name: 'Asupasa Mpongo', constituency: 'Busiki North', party: 'Independent', category: 'Constituency' },
  { id: 'p168', name: 'Catherin Mudederi', constituency: 'Kaliro District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p171', name: 'Alex Ngobi', constituency: 'Luuka South Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p170', name: 'Moses Walyomu', constituency: 'Kagoma Constituency', party: 'Independent', category: 'Constituency' },

  // Kamuli & Bugabula
  { id: 'p374', name: 'Kadaga Rebecca Alitwala', constituency: 'Kamuli District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'k1', name: 'Naikoba Prossy', constituency: 'Kamuli District Woman MP', party: 'CMP', category: 'Woman MP' },
  { id: 'k2', name: 'Nakisige Ritah', constituency: 'Kamuli District Woman MP', party: 'NUP', category: 'Woman MP' },
  { id: 'k3', name: 'Namatovu Mastula', constituency: 'Kamuli Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'k4', name: 'Bigirwa Moses', constituency: 'Kamuli Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'k5', name: 'Mugoya Godfrey', constituency: 'Kamuli Municipality', party: 'NUP', category: 'Constituency' },
  { id: 'k6', name: 'Luwano Aziz', constituency: 'Kamuli Municipality', party: 'NUP', category: 'Constituency' },
  { id: 'k7', name: 'Kayanga Baroda', constituency: 'Kamuli Municipality', party: 'DP', category: 'Constituency' },
  { id: 'k8', name: 'Tezikuba Faruk Joshua', constituency: 'Kamuli Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'b1', name: 'Mugabi Muzaale Martin', constituency: 'Buzaaya County', party: 'Independent', category: 'Constituency' },
  { id: 'b2', name: 'Wabwire Chrisostom', constituency: 'Buzaaya County', party: 'NRM', category: 'Constituency' },
  { id: 'b3', name: 'Wakabi Joseph', constituency: 'Buzaaya County', party: 'NUP', category: 'Constituency' },
  { id: 'b4', name: 'Kibikyo Yoweri Kidaga', constituency: 'Buzaaya County', party: 'Independent', category: 'Constituency' },
  { id: 'b5', name: 'Ssebidde Ammex', constituency: 'Buzaaya County', party: 'Independent', category: 'Constituency' },
  { id: 'b6', name: 'Kirenda Isabirye Samuel', constituency: 'Buzaaya County', party: 'Independent', category: 'Constituency' },
  { id: 'b7', name: 'Ataliba Irene', constituency: 'Buzaaya County', party: 'Independent', category: 'Constituency' },
  { id: 'b8', name: 'Mpasa Emmanuel', constituency: 'Buzaaya County', party: 'NRM', category: 'Constituency' },
  
  // Bugabula (Kamuli)
  { id: 'bg1', name: 'Bazanya Matayo', constituency: 'Bugabula South', party: 'Independent', category: 'Constituency' },
  { id: 'bg2', name: 'Muwanguzi Andrew', constituency: 'Bugabula South', party: 'Independent', category: 'Constituency' },
  { id: 'bg3', name: 'Kabanda Ronald Kirimani', constituency: 'Bugabula South', party: 'Independent', category: 'Constituency' },
  { id: 'bg4', name: 'Dhizaala Sanon Moses', constituency: 'Bugabula South', party: 'NRM', category: 'Constituency' },
  { id: 'bg5', name: 'Teira John', constituency: 'Bugabula North', party: 'Independent', category: 'Constituency' },
  { id: 'bg6', name: 'Lyavaala Joy', constituency: 'Bugabula North', party: 'Independent', category: 'Constituency' },
  { id: 'bg7', name: 'Akoberwa Abusaagi', constituency: 'Bugabula North', party: 'Independent', category: 'Constituency' },
  { id: 'bg8', name: 'Mulindwa George', constituency: 'Bugabula North', party: 'Independent', category: 'Constituency' },
  { id: 'bg9', name: 'Ntende Julius', constituency: 'Bugabula North', party: 'Independent', category: 'Constituency' },
  { id: 'bg10', name: 'Omondi Flavia', constituency: 'Bugabula North', party: 'Independent', category: 'Constituency' },

  // Serere
  { id: 'p181', name: 'Hellen Adoa', constituency: 'Serere Woman Seat', party: 'NRM', category: 'Woman MP' },
  { id: 'p182', name: 'Peter Paul Emaju', constituency: 'Kasilo County', party: 'Independent', category: 'Constituency' },
  { id: 'p183', name: 'Peter Carlos Ebiau', constituency: 'Kasilo', party: 'PFF', category: 'Constituency' },
  { id: 'p184', name: 'Fred Opolot', constituency: 'Pingire County', party: 'NRM', category: 'Constituency' },
  { id: 'p185', name: 'James Emaju', constituency: 'Kasilo', party: 'FDC', category: 'Constituency' },
  { id: 'p186', name: 'Peter Ogiit', constituency: 'Pingire', party: 'Independent', category: 'Constituency' },
  { id: 'p187', name: 'Deborah Akiteng', constituency: 'Serere Woman Seat', party: 'FDC', category: 'Woman MP' },
  { id: 'p188', name: 'Esther Lucy Acom', constituency: 'Serere Woman Seat', party: 'Independent', category: 'Woman MP' },
  { id: 'p189', name: 'Emmah Okwii', constituency: 'Serere County', party: 'Independent', category: 'Constituency' },
  { id: 'p190', name: 'Phillip Oucor', constituency: 'Pingire', party: 'Independent', category: 'Constituency' },
  { id: 'p191', name: 'Elijah Okupa', constituency: 'Kasilo', party: 'Independent', category: 'Constituency' },
  { id: 'p192', name: 'Stephen Ochola', constituency: 'Serere County', party: 'NRM', category: 'Constituency' },

  // Soroti
  { id: 'p193', name: 'Rodney Mukula Akongel', constituency: 'Soroti City East', party: 'Independent', category: 'Constituency' },
  { id: 'p194', name: 'Moses Attan Okia', constituency: 'Soroti City East', party: 'NRM', category: 'Constituency' },
  { id: 'p195', name: 'Joan Alobo', constituency: 'Soroti City East', party: 'Independent', category: 'Constituency' },
  { id: 'p196', name: 'Jonathan Ebwalu', constituency: 'Soroti City West', party: 'Independent', category: 'Constituency' },
  { id: 'p197', name: 'Martin Abilu', constituency: 'Soroti City East', party: 'NRM', category: 'Constituency' },
  { id: 'p198', name: 'Anna Adeke Ebaju', constituency: 'Soroti District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p199', name: 'Harriet Anyimo', constituency: 'Dakabela', party: 'Independent', category: 'Constituency' },
  { id: 'p200', name: 'Tom Julius Ekudo', constituency: 'Gweri', party: 'FDC', category: 'Constituency' },
  { id: 'p201', name: 'Daniel Eigu', constituency: 'Soroti County', party: 'FDC', category: 'Constituency' },
  { id: 'p202', name: 'Jonathan Erau', constituency: 'Dakabela', party: 'NRM', category: 'Constituency' },
  { id: 'p203', name: 'Peter Edeku', constituency: 'Dakabela', party: 'Independent', category: 'Constituency' },

  // Kumi
  { id: 'p204', name: 'Christine Apolot', constituency: 'Kumi Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p205', name: 'Monica Amoding', constituency: 'Kumi Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p206', name: 'Getrude Akomolot', constituency: 'Kumi Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p207', name: 'Kevin Akiror', constituency: 'Kumi Woman', party: 'NRM', category: 'Woman MP' },
  { id: 'p208', name: 'Mercy Gorreti Atemo', constituency: 'Kumi', party: 'Independent', category: 'Constituency' },
  { id: 'p209', name: 'Richard Ochom', constituency: 'Kumi Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p210', name: 'Silas Aogon', constituency: 'Kumi Municipality', party: 'NUP', category: 'Constituency' },
  { id: 'p211', name: 'Charles Olaboro', constituency: 'Kumi Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p212', name: 'Grace Amoriot', constituency: 'Kumi Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p213', name: 'Sidronious Opolot Okaasai', constituency: 'Kumi County', party: 'PFF', category: 'Constituency' },
  { id: 'p214', name: 'Charles Ilukor', constituency: 'Kumi County', party: 'NRM', category: 'Constituency' },
  { id: 'p215', name: 'Solomon Opio', constituency: 'Kumi County', party: 'Independent', category: 'Constituency' },

  // --- NORTHERN REGION ---
  // Gulu & Omoro & Aruu
  { id: 'p256', name: 'Martin Ojara Mapenduzi', constituency: 'Bar-Dege-Layibi Division Gulu', party: 'NUP', category: 'Constituency' },
  { id: 'p257', name: 'Lyandro Komakech', constituency: 'Bar-Dege-Layibi Division', party: 'NRM', category: 'Constituency' },
  { id: 'p258', name: 'Norbert Mao', constituency: 'Laroo-Pece Division', party: 'DP', category: 'Constituency' },
  { id: 'p259', name: 'Fr Charles Onen', constituency: 'Laroo-Pece Division', party: 'DP', category: 'Constituency' },
  { id: 'p260', name: 'Tonn Kiara', constituency: 'Laroo-Pece Division', party: 'Independent', category: 'Constituency' },
  { id: 'p261', name: 'Jusith Obina', constituency: 'Gulu City Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p262', name: 'Joyce Renni Alima', constituency: 'Gulu City Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p263', name: 'Kenneth Okot', constituency: 'Kilak North MP', party: 'Independent', category: 'Constituency' },
  { id: 'p264', name: 'Simon Peter Wokorach', constituency: 'Aswa County', party: 'Independent', category: 'Constituency' },
  { id: 'p265', name: 'Johnson Agara Olwa', constituency: 'Aswa County', party: 'Independent', category: 'Constituency' },
  { id: 'p364', name: 'Nancy Atimango', constituency: 'Gulu District Woman Representative', party: 'NRM', category: 'Woman MP' },
  { id: 'gulu1', name: 'Phoebe Ayoo', constituency: 'Gulu District Woman Representative', party: 'Independent', category: 'Woman MP' },
  { id: 'p360', name: 'Andrew Ojok Oulanyah', constituency: 'Omoro County', party: 'Independent', category: 'Constituency' },
  { id: 'p361', name: 'Catherine Lamwaka', constituency: 'Omoro District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p362', name: 'Samuel Odonga Otto', constituency: 'Aruu County', party: 'NUP', category: 'Constituency' },
  { id: 'p363', name: 'Anthony Akol', constituency: 'Kilak North County', party: 'Independent', category: 'Constituency' },

  // Apac & Oyam & Kwania
  { id: 'p68', name: 'Isaac Emma Odongo', constituency: 'Apac Municipality', party: 'UPC', category: 'Constituency' },
  { id: 'p124', name: 'Maxwell Akora', constituency: 'Apac Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p72', name: 'Agnes Atim Apea', constituency: 'Amolatar Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p78', name: 'Susan Achola Engola', constituency: 'Apac Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p69', name: 'Collines Angwech', constituency: 'Kioga County', party: 'UPC', category: 'Constituency' },
  { id: 'p70', name: 'Geoffrey Ocen', constituency: 'Kioga North', party: 'NRM', category: 'Constituency' },
  { id: 'p71', name: 'Peter Okodo', constituency: 'Kioga North', party: 'NRM', category: 'Constituency' },
  { id: 'p73', name: 'Willy Omodo Omodo Kagere', constituency: 'Oyam North', party: 'Independent', category: 'Constituency' },
  { id: 'p74', name: 'Samuel Junior Okello Engola', constituency: 'Oyam North', party: 'Independent', category: 'Constituency' },
  { id: 'p75', name: 'Ronald Roy Kaka', constituency: 'Oyam North', party: 'NRM', category: 'Constituency' },
  { id: 'p76', name: 'Benard Awuko', constituency: 'Oyam South', party: 'NRM', category: 'Constituency' },
  { id: 'p77', name: 'Geoffrey Owili', constituency: 'Oyam South', party: 'Independent', category: 'Constituency' },
  { id: 'p79', name: 'Peter Obong', constituency: 'Maruzi County', party: 'UPC', category: 'Constituency' },
  { id: 'p80', name: 'Benard Otim', constituency: 'Maruzi North', party: 'UPC', category: 'Constituency' },
  { id: 'p81', name: 'Tonny Eron', constituency: 'Kwania County', party: 'NRM', category: 'Constituency' },
  { id: 'p82', name: 'Tony Ayo', constituency: 'Kwania County', party: 'NRM', category: 'Constituency' },
  { id: 'p83', name: 'James Ongur Tar', constituency: 'Kwania North', party: 'Independent', category: 'Constituency' },
  { id: 'p84', name: 'Dr Eric Oket', constituency: 'Kwania County', party: 'Independent', category: 'Constituency' },
  
  // Otuke, Ajuri, Dokolo
  { id: 'p85', name: 'Richard Enen Okello', constituency: 'Otuke East', party: 'NRM', category: 'Constituency' },
  { id: 'p87', name: 'Julius Achon Bua', constituency: 'Otuke East', party: 'Independent', category: 'Constituency' },
  { id: 'p88', name: 'Grace Abote', constituency: 'Otuke Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p89', name: 'Paul Omara', constituency: 'Otuke County', party: 'NRM', category: 'Constituency' },
  { id: 'p90', name: 'Dr Collins Jennesio Okuu Oleng', constituency: 'Otuke East', party: 'Independent', category: 'Constituency' },
  { id: 'p86', name: 'Denis Hamson Obua', constituency: 'Ajuri County', party: 'NRM', category: 'Constituency' },
  { id: 'p121', name: 'Emmanuel Ongom Okwel', constituency: 'Ajuri County', party: 'DP', category: 'Constituency' },
  { id: 'p122', name: 'Jalameco Fred', constituency: 'Ajuri County', party: 'UPC', category: 'Constituency' },
  { id: 'p123', name: 'Stephen Omara', constituency: 'Ajuri County', party: 'Independent', category: 'Constituency' },
  { id: 'p119', name: 'Vincent Opito', constituency: 'Dokolo South', party: 'NUP', category: 'Constituency' },
  { id: 'p120', name: 'Felix Okot Ogong', constituency: 'Dokolo South', party: 'Independent', category: 'Constituency' },
  
  // West Nile (Arua, Nebbi, Yumbe, Moyo, Adjumani)
  { id: 'p125', name: 'DEBO RONALD', constituency: 'Arua Central Division', party: 'Independent', category: 'Constituency' },
  { id: 'p129', name: 'KASSIANO WADRI EZATI', constituency: 'Arua Central Division', party: 'Independent', category: 'Constituency' },
  { id: 'p126', name: 'SHEILLA OBIA', constituency: 'Arua City Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p127', name: 'DAPHINE DRAZA', constituency: 'Arua City Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p130', name: 'SANDRA EWAECABO', constituency: 'Arua City Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p128', name: 'LEMATIA JOHN', constituency: 'Ayivu West Division', party: 'Independent', category: 'Constituency' },
  { id: 'p131', name: 'ANGUYO GODFREY', constituency: 'Ayivu East Division', party: 'Independent', category: 'Constituency' },
  { id: 'p132', name: 'FETA GEOFFREY', constituency: 'Ayivu East Division', party: 'Independent', category: 'Constituency' },
  { id: 'p133', name: 'ONZIMA PHIONA', constituency: 'Ayivu West Division', party: 'Independent', category: 'Constituency' },
  { id: 'p134', name: 'TIYO ODAA', constituency: 'Ayivu East Division', party: 'Independent', category: 'Constituency' },
  { id: 'p139', name: 'BAYO CHRISTOPHER', constituency: 'Ayivu West Division', party: 'Independent', category: 'Constituency' },
  { id: 'p135', name: 'ZUMURA MANENO', constituency: 'Obongi District Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p136', name: 'CHARLES LAGU', constituency: 'Moyo West', party: 'UPC', category: 'Constituency' },
  { id: 'p137', name: 'ONGIERTHO EMMANUEL', constituency: 'Nebbi Municipality', party: 'DP', category: 'Constituency' },
  { id: 'p138', name: 'FIONA NYAMUTORO', constituency: 'Nebbi District Woman', party: 'NRM', category: 'Woman MP' },
  { id: 'p140', name: 'AVAKO MELSA NAIMA', constituency: 'Yumbe District Woman', party: 'NUP', category: 'Woman MP' },
  { id: 'p144', name: 'FIKIRA YASIN', constituency: 'Yumbe District Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p141', name: 'EZAMA SIRAJI BRAHAN', constituency: 'Aringa Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p142', name: 'KARIMU MUSA', constituency: 'Aringa Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p143', name: 'MUSEMA BRUCE', constituency: 'Aringa South', party: 'NUP', category: 'Constituency' },
  { id: 'p145', name: 'TAIRI ASIRAFU', constituency: 'Aringa Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p146', name: 'GODFREY ONZIMA', constituency: 'Aringa North', party: 'NRM', category: 'Constituency' },
  { id: 'p147', name: 'OLEGA ASHRAF', constituency: 'Aringa Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p148', name: 'MOSES ALI', constituency: 'Adjumani West', party: 'NRM', category: 'Constituency' },
  { id: 'p149', name: 'PATRICK TANDRUPASI', constituency: 'Adjumani West', party: 'FDC', category: 'Constituency' },
  { id: 'p151', name: 'DRAGA GASPER', constituency: 'Adjumani West', party: 'Independent', category: 'Constituency' },
  { id: 'p150', name: 'ANGEL DULU MARK', constituency: 'Adjumani East', party: 'NRM', category: 'Constituency' },
  { id: 'p152', name: 'JAMES MAMAWI', constituency: 'Adjumani East', party: 'Independent', category: 'Constituency' },
  { id: 'p153', name: 'ABABIKU JESCA', constituency: 'Adjumani District Woman', party: 'NRM', category: 'Woman MP' },
  { id: 'p154', name: 'LINA BANGI', constituency: 'Adjumani District Woman', party: 'Independent', category: 'Woman MP' },

  // --- WESTERN REGION ---
  // Kabale & Rubanda & Kisoro
  { id: 'p216', name: 'David Bahati', constituency: 'Ndorwa West', party: 'NRM', category: 'Constituency' },
  { id: 'p225', name: 'Gilbert Masiko', constituency: 'Ndorwa West', party: 'NRM', category: 'Constituency' },
  { id: 'p217', name: 'Erias Sunday', constituency: 'Ndorwa East', party: 'Independent', category: 'Constituency' },
  { id: 'p220', name: 'Alexander Kyomkwijuka', constituency: 'Ndorwa East', party: 'Independent', category: 'Constituency' },
  { id: 'p229', name: 'Wilfred Niwagaba', constituency: 'Ndorwa East', party: 'NUP', category: 'Constituency' },
  { id: 'p231', name: 'Dr Protazio Begumisa', constituency: 'Ndorwa East', party: 'Independent', category: 'Constituency' },
  { id: 'p218', name: 'Dan Musinguzi Nabasa', constituency: 'Kabale Municipality', party: 'NRM', category: 'Constituency' },
  { id: 'p219', name: 'Brain Arinaitwe', constituency: 'Kabale Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p228', name: 'Alex Muhwezi', constituency: 'Kabale Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p230', name: 'Nicholas Kamara', constituency: 'Kabale Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p221', name: 'Enid Origumisiriza', constituency: 'Kabale District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p222', name: 'Catherine Ndamira', constituency: 'Kabale District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p223', name: 'Grace Ankunda Bekunda', constituency: 'Kabale District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p224', name: 'Trust Kyomugisha', constituency: 'Kabale District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p226', name: 'Tracy Ninsiima', constituency: 'Kabale District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p227', name: 'Rosette Asiimwe', constituency: 'Kabale District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p232', name: 'Henry Musasizi', constituency: 'Rubanda East', party: 'NRM', category: 'Constituency' },
  { id: 'p235', name: 'Jogo Kenneth Biryabarema', constituency: 'Rubanda East', party: 'Independent', category: 'Constituency' },
  { id: 'p233', name: 'Moses Kamuntu Mwongyera', constituency: 'Rubanda West', party: 'NRM', category: 'Constituency' },
  { id: 'p234', name: 'Bruce Kabasa', constituency: 'Rubanda West', party: 'NRM', category: 'Constituency' },
  { id: 'p236', name: 'Evelyne Ninsiima', constituency: 'Rubanda District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p237', name: 'Asigario Turyagyenda', constituency: 'Bukimbiri County', party: 'NRM', category: 'Constituency' },
  { id: 'p238', name: 'Leo Nfitimana', constituency: 'Kisoro Municipality', party: 'ANT', category: 'Constituency' },
  { id: 'p239', name: 'Abel Bizimana', constituency: 'Bufumbira East', party: 'NRM', category: 'Constituency' },
  { id: 'p240', name: 'Alex Niyonsaba Seruganda', constituency: 'Bufumbira South', party: 'Independent', category: 'Constituency' },
  { id: 'p241', name: 'Sam Bitangaro', constituency: 'Bufumbira South', party: 'Independent', category: 'Constituency' },
  { id: 'p244', name: 'Dam Munyambabazi', constituency: 'Bufumbira South', party: 'NRM', category: 'Constituency' },
  { id: 'p242', name: 'John Kamara', constituency: 'Bufumbira North', party: 'Independent', category: 'Constituency' },
  { id: 'p243', name: 'Daniel Ngirabakunzi', constituency: 'Bufumbira North', party: 'Independent', category: 'Constituency' },
  
  // Kanungu & Rukiga
  { id: 'p245', name: 'Chris Baryomunsi', constituency: 'Kinkizi East', party: 'NRM', category: 'Constituency' },
  { id: 'p246', name: 'Sam Kajojo Arinaitwe', constituency: 'Kinkizi East', party: 'Independent', category: 'Constituency' },
  { id: 'p247', name: 'John Ndungutse', constituency: 'Kinkizi West', party: 'Independent', category: 'Constituency' },
  { id: 'p248', name: 'Turyatunga Stephen Ikamukuba', constituency: 'Kinkizi West', party: 'Independent', category: 'Constituency' },
  { id: 'p251', name: 'Christopher Safari', constituency: 'Kinkizi West', party: 'Independent', category: 'Constituency' },
  { id: 'p249', name: 'Esther Majambere Musoke', constituency: 'Kanungu District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p250', name: 'Betty Namara Kataba', constituency: 'Kanungu District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p252', name: 'Damson Kivumbi', constituency: 'Rukiga County', party: 'DP', category: 'Constituency' },
  { id: 'p253', name: 'Roland Ndyomugyenyi', constituency: 'Rukiga County', party: 'DP', category: 'Constituency' },
  { id: 'p254', name: 'Patrick Kiconco Katabazi', constituency: 'Rukiga County', party: 'Independent', category: 'Constituency' },
  { id: 'p255', name: 'Jackeline Tukamushaba', constituency: 'Rukiga District Woman MP', party: 'NRM', category: 'Woman MP' },

  // Fort Portal, Kasese, Bunyoro
  { id: 'p266', name: 'Rwabuhinga Richard', constituency: 'Burahya County', party: 'Independent', category: 'Constituency' },
  { id: 'p267', name: 'Kirungi Annet Pamela', constituency: 'Burahya County', party: 'Independent', category: 'Constituency' },
  { id: 'p268', name: 'Linda Irene Mugisa', constituency: 'Fort Portal Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p270', name: 'Marjorie Annet Kasiime', constituency: 'Fort Portal Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p271', name: 'Sylivia Rwabwongo', constituency: 'Fort Portal Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p269', name: 'Margrete Muhanga Mugisa', constituency: 'Fort Portal North Division', party: 'NRM', category: 'Constituency' },
  { id: 'p272', name: 'Mugisa Reuben', constituency: 'Fort Portal Central Division', party: 'Independent', category: 'Constituency' },
  { id: 'p273', name: 'Muhenda Ronald', constituency: 'Fort Portal Central Division', party: 'NRM', category: 'Constituency' },
  { id: 'p278', name: 'Janifer Kyomuhendo Mbabazi', constituency: 'Kagadi District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p279', name: 'Naziwa Magret Rujumba', constituency: 'Kagadi District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p280', name: 'Nahwera Prossy', constituency: 'Kagadi District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p281', name: 'Sarah Ithungu Masereka Baleke', constituency: 'Kasese District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p282', name: 'Florence Kabugho', constituency: 'Kasese District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p342', name: 'Asiasa Ruth Katya', constituency: 'Kasese District Woman MP', party: 'PFF', category: 'Woman MP' },
  { id: 'p343', name: 'Katembo Fatuma Kamama', constituency: 'Kasese District Woman MP', party: 'NUP', category: 'Woman MP' },
  { id: 'p344', name: 'Kabugho Marylin', constituency: 'Kasese District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p283', name: 'Jackson Mbaju Kathika', constituency: 'Busongora South', party: 'Independent', category: 'Constituency' },
  { id: 'p335', name: 'Mulindwa David Isimbwa', constituency: 'Busongora County South', party: 'NRM', category: 'Constituency' },
  { id: 'p336', name: 'Kighema Alozius Baguma', constituency: 'Busongora County South', party: 'NRM', category: 'Constituency' },
  { id: 'p284', name: 'Francis Mugisa Kithulha', constituency: 'Kasese Municipality', party: 'NRM', category: 'Constituency' },
  { id: 'p285', name: 'John Sibendire Katusabe', constituency: 'Kasese Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p337', name: 'Kambale Ferigo', constituency: 'Kasese Municipality', party: 'NUP', category: 'Constituency' },
  { id: 'p338', name: 'Centenary Franco Robert', constituency: 'Kasese Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p339', name: 'Mafunguro Joseph', constituency: 'Kasese Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p340', name: 'Muthoma Robert', constituency: 'Kasese Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p341', name: 'Mugisa Francis Kithulha', constituency: 'Kasese Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p286', name: 'Chrispus Kiyonga', constituency: 'Bukonzo West', party: 'Independent', category: 'Constituency' },
  { id: 'p328', name: 'Bwambale Cleous Tinkasimire', constituency: 'Bukonzo County East', party: 'Independent', category: 'Constituency' },
  { id: 'p329', name: 'Monday Julius Rude', constituency: 'Bukonzo County East', party: 'Independent', category: 'Constituency' },
  { id: 'p330', name: 'Masereka Sylvest', constituency: 'Bukonzo County East', party: 'Independent', category: 'Constituency' },
  { id: 'p331', name: 'Muhindo Harold Tonny', constituency: 'Bukonzo County East', party: 'Independent', category: 'Constituency' },
  { id: 'p332', name: 'Kitanywa Sowedi', constituency: 'Bukonzo County North', party: 'NRM', category: 'Constituency' },
  { id: 'p333', name: 'Nzoghu Musabe William', constituency: 'Bukonzo County North', party: 'FDC', category: 'Constituency' },
  { id: 'p334', name: 'Masereka Robert', constituency: 'Bukonzo County North', party: 'Independent', category: 'Constituency' },
  
  // Kibaale, Kakumiro, Buliisa, Kikuube, Hoima
  { id: 'p287', name: 'Matia Kasaija', constituency: 'Buyanja County', party: 'Independent', category: 'Constituency' },
  { id: 'p290', name: 'Kyalimpa Paul', constituency: 'Buyanja County', party: 'Independent', category: 'Constituency' },
  { id: 'p288', name: 'Emily Kugonza', constituency: 'Buyanja East', party: 'Independent', category: 'Constituency' },
  { id: 'p289', name: 'Kisembo Basemera Noeline', constituency: 'Kibaale District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p291', name: 'Nabaduka Annet', constituency: 'Kibaale District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p292', name: 'Nabanja Robbinah', constituency: 'Kakumiro District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p299', name: 'Grace Bataringaya', constituency: 'Kakumiro District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p300', name: 'Harriet Sari', constituency: 'Kakumiro District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p293', name: 'Fred Byamukama', constituency: 'Bugangaizi West', party: 'Independent', category: 'Constituency' },
  { id: 'p295', name: 'Jimmy Kisembo Wakame', constituency: 'Bugangaizi West', party: 'Independent', category: 'Constituency' },
  { id: 'p294', name: 'Onesmus Twinamastiko', constituency: 'Bugangaizi East', party: 'Independent', category: 'Constituency' },
  { id: 'p296', name: 'Kusiima Godfrey', constituency: 'Bugangaizi East', party: 'NRM', category: 'Constituency' },
  { id: 'p297', name: 'Prof George William Lubega', constituency: 'Bugangaizi South', party: 'Independent', category: 'Constituency' },
  { id: 'p298', name: 'Tumwesige Josephat', constituency: 'Bugangaizi South', party: 'Independent', category: 'Constituency' },
  { id: 'p301', name: 'Samuel Bahemuka', constituency: 'Buliisa County', party: 'Independent', category: 'Constituency' },
  { id: 'p302', name: 'Robert Kagoro Mugume', constituency: 'Buliisa County', party: 'Independent', category: 'Constituency' },
  { id: 'p303', name: 'Maxwell Atuhura', constituency: 'Buliisa County', party: 'NRM', category: 'Constituency' },
  { id: 'p304', name: 'Charles Bedijo', constituency: 'Buliisa County', party: 'Independent', category: 'Constituency' },
  { id: 'p305', name: 'Norah Bigirwa Nyendwoha', constituency: 'Buliisa District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p306', name: 'Hannifah Nyangoma', constituency: 'Buliisa District Woman MP', party: 'FDC', category: 'Woman MP' },
  { id: 'p307', name: 'Fiona Mary Lawino', constituency: 'Buliisa District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p308', name: 'Joan Kyomuhendo', constituency: 'Kikuube District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p309', name: 'Flora Natumanya', constituency: 'Kikuube District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p310', name: 'Francis Kazini Twinomujuni', constituency: 'Buhaguzi County', party: 'NRM', category: 'Constituency' },
  { id: 'p311', name: 'Daniel Muhairwe Mpamizo', constituency: 'Buhaguzi County', party: 'Independent', category: 'Constituency' },
  { id: 'p312', name: 'Ssenjubu Peter', constituency: 'Buhaguzi County', party: 'Independent', category: 'Constituency' },
  { id: 'p313', name: 'Nelson Junjura', constituency: 'Buhaguzi East County', party: 'Independent', category: 'Constituency' },
  { id: 'p314', name: 'Julius Bigirwa Junjura', constituency: 'Buhaguzi East County', party: 'NRM', category: 'Constituency' },
  { id: 'p315', name: 'Stephen Aseera Itaza', constituency: 'Buhaguzi East County', party: 'Independent', category: 'Constituency' },
  { id: 'p316', name: 'Asinansi Nyakato', constituency: 'Hoima City Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p317', name: 'Bridget Kiiza', constituency: 'Hoima City Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p318', name: 'Ismail Kasule', constituency: 'Hoima West Division', party: 'NUP', category: 'Constituency' },
  { id: 'p319', name: 'Dr Joseph Ruyonga', constituency: 'Hoima West Division', party: 'ANT', category: 'Constituency' },
  { id: 'p320', name: 'Ronald Kato Rwahwire', constituency: 'Hoima West Division', party: 'NUP', category: 'Constituency' },
  { id: 'p321', name: 'Geoffrey Beraheru', constituency: 'Hoima East', party: 'ANT', category: 'Constituency' },
  { id: 'p322', name: 'Beatrice Wembabazi', constituency: 'Hoima District Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'p323', name: 'Harriet Businge', constituency: 'Hoima District Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'p324', name: 'Pius Wakabi Rujumba', constituency: 'Bugahya County', party: 'Independent', category: 'Constituency' },
  { id: 'p325', name: 'Herbert Kato', constituency: 'Bugahya County', party: 'Independent', category: 'Constituency' },
  { id: 'p326', name: 'Dr Gerald Kasigwa', constituency: 'Kigorobya County', party: 'Independent', category: 'Constituency' },
  { id: 'p327', name: 'David Karubanga', constituency: 'Kigorobya County', party: 'Independent', category: 'Constituency' },

  // --- CENTRAL REGION & OTHERS ---
  // Katikamu (Luweero)
  { id: 'p172', name: 'Peter Kinaje Nsibambi', constituency: 'Katikamu South', party: 'Independent', category: 'Constituency' },
  { id: 'p173', name: 'Patricia Magara', constituency: 'Katikamu South', party: 'Independent', category: 'Constituency' },
  { id: 'p174', name: 'Michael Kintu', constituency: 'Katikamu South', party: 'Independent', category: 'Constituency' },
  { id: 'p176', name: 'George Ssemakula', constituency: 'Katikamu South', party: 'Independent', category: 'Constituency' },
  { id: 'p177', name: 'Hassan Kirumira', constituency: 'Katikamu South', party: 'Independent', category: 'Constituency' },
  { id: 'p178', name: 'Alfred Muwanga', constituency: 'Katikamu South', party: 'Independent', category: 'Constituency' },
  { id: 'p179', name: 'Zenar Nasur', constituency: 'Katikamu South', party: 'DF', category: 'Constituency' },
  { id: 'p180', name: 'Milly Natembo', constituency: 'Katikamu South', party: 'NRM', category: 'Constituency' },
  { id: 'p348', name: 'Ronal Ndaula', constituency: 'Katikamu North', party: 'NRM', category: 'Constituency' },
  { id: 'p351', name: 'Denis Ssekabira', constituency: 'Katikamu North', party: 'Independent', category: 'Constituency' },
  { id: 'p346', name: 'Agnes Kirabo', constituency: 'Luweero District Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p357', name: 'Brenda Nabukenya', constituency: 'Luweero District Woman', party: 'NRM', category: 'Woman MP' },
  { id: 'p359', name: 'Maureen Nakuya', constituency: 'Luweero District Woman', party: 'Independent', category: 'Woman MP' },
  { id: 'p353', name: 'Robert Ssekitoleko', constituency: 'Bamunanika', party: 'NUP', category: 'Constituency' },
  { id: 'p356', name: 'Thompson Ssebabuga', constituency: 'Bamunanika', party: 'Independent', category: 'Constituency' },

  // Mukono
  { id: 'p91', name: 'Ronald Kibuule', constituency: 'Mukono North Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p108', name: 'Isaac Drasi', constituency: 'Mukono North Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p92', name: 'Sulaiman Kiwanuka', constituency: 'Nakifuma County', party: 'NRM', category: 'Constituency' },
  { id: 'p96', name: 'Robert Kafeero Ssekitoreko', constituency: 'Nakifuma County', party: 'NRM', category: 'Constituency' },
  { id: 'p101', name: 'Joshua Waswa Mugirya', constituency: 'Nakifuma County', party: 'Independent', category: 'Constituency' },
  { id: 'p93', name: 'Robert Maseruka', constituency: 'Mukono South Constituency', party: 'NRM', category: 'Constituency' },
  { id: 'p100', name: 'Vincent Grace Luswata', constituency: 'Mukono South Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p102', name: 'Esther Gibone', constituency: 'Mukono South Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p104', name: 'Loy Mwesigwa', constituency: 'Mukono South Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p110', name: 'Mubarak Ssekikubo', constituency: 'Mukono South Constituency', party: 'Independent', category: 'Constituency' },
  { id: 'p95', name: 'Daisy Sarah Ssonko Nabantazi', constituency: 'Mukono Municipality', party: 'NRM', category: 'Woman MP' },
  { id: 'p99', name: 'Betty Nambooze', constituency: 'Mukono Municipality', party: 'NUP', category: 'Woman MP' },
  { id: 'p103', name: 'Peter Bakaluba Mukasa', constituency: 'Mukono Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p105', name: 'Hanifa Nabukeera', constituency: 'Mukono Municipality', party: 'Independent', category: 'Woman MP' },
  { id: 'p107', name: 'Andrew Ssenyonga', constituency: 'Mukono Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'p94', name: 'Vitarine Nasubuga Nalumansi', constituency: 'Woman MP Mukono', party: 'NRM', category: 'Woman MP' },
  { id: 'p97', name: 'Margaret Nakavubu Bakubi', constituency: 'Woman MP Mukono', party: 'Independent', category: 'Woman MP' },
  { id: 'p98', name: 'Shielah Dravile Amaniyo', constituency: 'Woman MP Mukono', party: 'Independent', category: 'Woman MP' },
  { id: 'p106', name: 'Peace Kusasira', constituency: 'Woman MP Mukono', party: 'Independent', category: 'Woman MP' },
  { id: 'p109', name: 'Norah Sylivia Namutosi', constituency: 'Woman MP Mukono', party: 'Independent', category: 'Woman MP' },
  { id: 'p118', name: 'Salima Nsibambi Nkuse', constituency: 'Woman MP Mukono', party: 'Independent', category: 'Woman MP' },

  // Wakiso
  { id: 'w1', name: 'Beth Kankunda Kayesu', constituency: 'Wakiso Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'w2', name: 'Betty Ethel Naluyima', constituency: 'Wakiso Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'w3', name: 'Irene Mpamulungi', constituency: 'Wakiso Woman MP', party: 'FDC', category: 'Woman MP' },
  { id: 'w4', name: 'Rose Kirabira', constituency: 'Wakiso Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'w5', name: 'Joreen Najemba', constituency: 'Wakiso Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'w6', name: 'Annet Nakyanja Mawejje', constituency: 'Wakiso Woman MP', party: 'NRM', category: 'Woman MP' },
  { id: 'w7', name: 'Joan Nabatanzi', constituency: 'Wakiso Woman MP', party: 'Independent', category: 'Woman MP' },
  { id: 'w8', name: 'Medard Lubega Ssegona', constituency: 'Busiro East', party: 'NUP', category: 'Constituency' },
  
  // Nansana Municipality
  { id: 'n1', name: 'Zambaali Bulasio Mukasa', constituency: 'Nansana Municipality', party: 'NUP', category: 'Constituency' },
  { id: 'n2', name: 'Ramathan Mutebi', constituency: 'Nansana Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'n3', name: 'Stephen Kaweesa', constituency: 'Nansana Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'n4', name: 'Joseph Musoke', constituency: 'Nansana Municipality', party: 'FDC', category: 'Constituency' },
  { id: 'n5', name: 'Idi Bugaga Matovu', constituency: 'Nansana Municipality', party: 'NUP', category: 'Constituency' },
  { id: 'n6', name: 'Juliet Kayala Kyambadde', constituency: 'Nansana Municipality', party: 'PFF', category: 'Constituency' },
  { id: 'n7', name: 'Fred Luyinda', constituency: 'Nansana Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'n8', name: 'Harold Kaija', constituency: 'Nansana Municipality', party: 'FDC', category: 'Constituency' },
  { id: 'n9', name: 'Henry Lubowa', constituency: 'Nansana Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'n10', name: 'Hamisi Musoke Walusimbi', constituency: 'Nansana Municipality', party: 'PFF', category: 'Constituency' },
  { id: 'n11', name: 'Florence Kintu', constituency: 'Nansana Municipality', party: 'Independent', category: 'Constituency' },

  // Makindye Ssabagabo
  { id: 'ms1', name: 'Godfrey Ssemwanga', constituency: 'Makindye Ssabagabo', party: 'NUP', category: 'Constituency' },
  { id: 'ms2', name: 'Akram Lutaaya', constituency: 'Makindye Ssabagabo', party: 'Independent', category: 'Constituency' },
  { id: 'ms3', name: 'David Sserukenya', constituency: 'Makindye Ssabagabo', party: 'Independent', category: 'Constituency' },
  { id: 'ms4', name: 'Joshua Makula', constituency: 'Makindye Ssabagabo', party: 'NRM', category: 'Constituency' },
  { id: 'ms5', name: 'Dick Rwegaba', constituency: 'Makindye Ssabagabo', party: 'Independent', category: 'Constituency' },
  { id: 'ms6', name: 'Isaac Muzeyi', constituency: 'Makindye Ssabagabo', party: 'NRM', category: 'Constituency' },
  { id: 'ms7', name: 'Javira Nsamba Lubadde', constituency: 'Makindye Ssabagabo', party: 'Independent', category: 'Constituency' },
  { id: 'ms8', name: 'Birungi Rebecca Mary', constituency: 'Makindye Ssabagabo', party: 'NRM', category: 'Constituency' },

  // Entebbe Municipality
  { id: 'e1', name: 'Irene Melinda Nantumbwe', constituency: 'Entebbe Municipality', party: 'EPU', category: 'Constituency' },
  { id: 'e2', name: 'Yusuf Kanakulya', constituency: 'Entebbe Municipality', party: 'Independent', category: 'Constituency' },
  { id: 'e3', name: 'Vicent Kayanja DePaul', constituency: 'Entebbe Municipality', party: 'DP', category: 'Constituency' },
  { id: 'e4', name: 'Joyce Nabatta Namuli', constituency: 'Entebbe Municipality', party: 'NUP', category: 'Constituency' },
];

// Helper to detect district from constituency string for coordinate mapping
const getCoordinates = (constituency: string): [number, number] | undefined => {
  for (const [district, coords] of Object.entries(DISTRICT_COORDS)) {
    if (constituency.includes(district)) {
      // Add slight jitter to separate markers in same district
      const jitter = 0.005;
      return [
        coords[0] + (Math.random() - 0.5) * jitter,
        coords[1] + (Math.random() - 0.5) * jitter
      ];
    }
  }
  return undefined;
};

// Calculate Base Strength for each candidate
const calculatePoliticalStrength = (candidate: { party: string, constituency: string }) => {
  const constituencyLower = candidate.constituency.toLowerCase();
  
  // Regional Detection
  const isWest = /mbarara|kabale|kasese|hoima|fort portal|masindi|kiruhura|isingiro|ntungamo|rukungiri|kanungu|kisoro|rubanda|rukiga|sheema|bushenyi|mitooma|buhweju|bunyangabu|kabarole|ntoroko|bundibugyo|kagadi|kakumiro|kibaale|buliisa|kikuube|kyenjojo/.test(constituencyLower);
  
  const isCentral = /kampala|wakiso|mukono|masaka|mpigi|luweero|nakawa|kawempe|makindye|rubaga|nansana|entebbe|busiro|kyadondo|mityana|mubende|kassanda|gomba|butambala|kalungu|bukomansimbi|lwengo|lyantonde|rakai|kyotera|sembabule|kayunga|buikwe|buvuma/.test(constituencyLower);
  
  const isNorth = /gulu|lira|oyam|apac|arua|west nile|kitgum|agago|amolatar|nebbi|yumbe|moyo|adjumani|omoro|nwoya|koboko|zombo|otuke|ajuri|dokolo|lamwo|pader/.test(constituencyLower);
  
  const isEast = /mbale|sironko|manafwa|tororo|jinja|bugweri|bulambuli|busoga|elgon|kamuli|iganga|kaliro|luuka|bugweri|mayuge|bugiri|busia|namisindwa|mayuge|soroti|kumi|serere|ngora|bukedea|katakwi|amuria|kaberamaido|kapchorwa/.test(constituencyLower);

  // Sub-regions
  const isLango = /apac|oyam|lira|dokolo|kwania|otuke|ajuri|amolatar/.test(constituencyLower); // UPC Stronghold
  const isTeso = /soroti|kumi|serere|ngora|bukedea|katakwi|amuria|kaberamaido/.test(constituencyLower); // FDC Stronghold
  const isKasese = /kasese/.test(constituencyLower); // FDC competitive
  const isBusoga = /jinja|kamuli|iganga|kaliro|luuka|bugweri|mayuge|bugiri/.test(constituencyLower); // NRM/NUP battleground
  const isCity = /city|municipality|division|kampala|wakiso/.test(constituencyLower); // Urban centers favor Opposition

  let baseScore = 100;

  // Party Logic
  if (candidate.party === 'NRM') {
      baseScore = 120;
      if (isWest) baseScore *= 2.5; // Very strong home region
      if (isCentral) baseScore *= 0.6; // Weak in Buganda
      if (isNorth) baseScore *= 1.2;
      if (isEast) baseScore *= 1.2;
      if (isCity) baseScore *= 0.7; // Weaker in urban centers
  } else if (candidate.party === 'NUP') {
      baseScore = 100;
      if (isCentral) baseScore *= 2.2; // Dominant in Buganda
      if (isCity) baseScore *= 1.5; // Strong in cities
      if (isWest) baseScore *= 0.4;
      if (isNorth) baseScore *= 0.5;
      if (isBusoga) baseScore *= 1.3;
  } else if (candidate.party === 'FDC') {
      baseScore = 80;
      if (isTeso) baseScore *= 2.5; // Stronghold
      if (isKasese) baseScore *= 2.0;
      if (isWest && !isKasese) baseScore *= 0.5;
      if (isNorth) baseScore *= 1.2; // Acholi/West Nile pockets
  } else if (candidate.party === 'UPC') {
      baseScore = 50;
      if (isLango) baseScore *= 4.0; // Very Dominant in Lango
      else baseScore *= 0.3; // Irrelevant elsewhere usually
  } else if (candidate.party === 'DP') {
      baseScore = 40;
      if (isCentral) baseScore *= 1.2; // Historical pockets
      else baseScore *= 0.2;
  } else if (candidate.party === 'Independent') {
      baseScore = 60 * (0.5 + Math.random() * 1.5); // Wildcard
  } else {
      baseScore = 20; // Others
  }

  // Random Jitter for Individual Appeal
  baseScore *= (0.8 + Math.random() * 0.4);

  return baseScore;
};

// First Pass: Calculate Strengths
const candidatesWithStrength = RAW_CANDIDATES.map(c => ({
    ...c,
    rawStrength: calculatePoliticalStrength(c),
    coordinates: getCoordinates(c.constituency)
}));

// Group by Constituency
const groupedCandidates: Record<string, typeof candidatesWithStrength> = {};
candidatesWithStrength.forEach(c => {
    if (!groupedCandidates[c.constituency]) groupedCandidates[c.constituency] = [];
    groupedCandidates[c.constituency].push(c);
});

// Second Pass: Normalize to realistic Vote Shares
export const PARLIAMENTARY_DATA: ParliamentaryCandidate[] = [];

Object.values(groupedCandidates).forEach(group => {
    const totalStrength = group.reduce((sum, c) => sum + c.rawStrength, 0);
    
    // Simulate some vote share going to "Others" not in the list (1-5%)
    const othersShare = Math.random() * 5 + 1;
    const availableShare = 100 - othersShare;

    group.forEach(c => {
        const share = (c.rawStrength / totalStrength) * availableShare;
        
        // Sentiment usually correlates with vote share but with noise (scandals etc)
        let sentiment = share * 1.5 + 20 + (Math.random() * 20 - 10);
        sentiment = Math.min(98, Math.max(10, Math.floor(sentiment)));
        
        // Mentions correlate with urbanity and controversy/success
        const isCity = /City|Municipality|Division/.test(c.constituency);
        let mentions = isCity ? 5000 : 1000;
        mentions = Math.floor(mentions * (share / 20) * (0.8 + Math.random()));

        PARLIAMENTARY_DATA.push({
            id: c.id,
            name: c.name,
            constituency: c.constituency,
            party: c.party,
            category: c.category,
            sentimentScore: sentiment,
            projectedVoteShare: Number(share.toFixed(1)),
            mentions: mentions,
            coordinates: c.coordinates
        });
    });
});

/**
 * Generates a realistic profile for a constituency based on its name and keywords.
 * This mocks data that would normally come from a backend API or UBOS database.
 */
export const getConstituencyProfile = (constituency: string, candidateName?: string, candidateParty?: string): ConstituencyProfile => {
  const isCity = /City|Municipality|Division/.test(constituency);
  const isWomanMP = /Woman MP|Woman Seat|District Woman/.test(constituency);
  const constituencyLower = constituency.toLowerCase();

  // Determine Region based on keywords (Same logic as above for consistency)
  let region = 'Central';
  if (/mbale|sironko|manafwa|tororo|jinja|bugweri|bulambuli|busoga|elgon|kamuli|iganga|kaliro|luuka|bugiri|busia|namisindwa|soroti|kumi|serere|ngora|kapchorwa/.test(constituencyLower)) region = 'Eastern';
  else if (/gulu|lira|oyam|apac|arua|west nile|kitgum|agago|amolatar|nebbi|yumbe|moyo|adjumani|omoro|nwoya|koboko|zombo/.test(constituencyLower)) region = 'Northern';
  else if (/mbarara|kabale|kasese|hoima|fort portal|masindi|kiruhura|isingiro|ntungamo|rukungiri|kanungu|kisoro|rubanda|rukiga|sheema|bushenyi|mitooma|buhweju|bunyangabu|kabarole|ntoroko|bundibugyo|kagadi|kakumiro|kibaale|buliisa/.test(constituencyLower)) region = 'Western';

  // Generate demographics based on type
  const basePop = isWomanMP ? 250000 : 95000; // District Woman MPs represent larger areas
  const variation = Math.floor(Math.random() * 40000) - 20000;
  const totalPop = basePop + variation;
  const voterRate = 0.45 + (Math.random() * 0.1); // ~45-55% are registered voters
  
  // Socio-economic heuristics
  let povertyIndex = '20.3%'; // National Average approx
  let literacy = 76;
  let activity = 'Subsistence Farming';
  let electricity = 28; // National grid access approx

  if (isCity || /Kampala|Wakiso|Entebbe|Jinja City|Mbarara City|Gulu City|Mbale City|Arua City|Fort Portal City|Hoima City|Lira City|Soroti City|Masaka City/.test(constituency)) {
    povertyIndex = '9.2%';
    literacy = 89;
    activity = 'Trade & Services';
    electricity = 75;
  } else if (region === 'Northern' && !isCity) {
    povertyIndex = '32.5%';
    literacy = 68;
    activity = 'Mixed Farming';
    electricity = 15;
  } else if (region === 'Eastern' && !isCity) {
    povertyIndex = '24.3%';
    literacy = 71;
    activity = 'Crop Agriculture';
    electricity = 22;
  } else if (region === 'Western' && !isCity) {
    povertyIndex = '15.6%';
    literacy = 74;
    activity = 'Dairy & Crops';
    electricity = 25;
  }

  // Determine Historical Winner logic based on region
  let prevWinner = 'NRM';
  if (region === 'Central') prevWinner = 'NUP'; // 2021 Wave
  if (region === 'Northern' && /apac|oyam|lira|dokolo/.test(constituencyLower)) prevWinner = 'UPC'; 
  if (region === 'Western' && /kasese/.test(constituencyLower)) prevWinner = 'FDC';
  if (region === 'Eastern' && /soroti|kumi|serere/.test(constituencyLower)) prevWinner = 'FDC';
  
  // Function to generate breakdown
  const generateBreakdown = (winner: string, winShare: number) => {
      const remaining = 100 - winShare;
      const results: PartyResult[] = [{ party: winner, percentage: Math.round(winShare) }];
      
      const majorParties = ['NRM', 'NUP', 'FDC', 'Independent', 'DP', 'UPC'].filter(p => p !== winner);
      let currentRemaining = remaining;
      
      const secondPlace = Math.min(currentRemaining - 5, Math.floor(currentRemaining * 0.7));
      results.push({ party: majorParties[0], percentage: secondPlace });
      currentRemaining -= secondPlace;
      
      if (currentRemaining > 5) {
          const thirdPlace = Math.floor(currentRemaining * 0.6);
           results.push({ party: majorParties[1], percentage: thirdPlace });
           currentRemaining -= thirdPlace;
      }
      
      if (currentRemaining > 0) {
           results.push({ party: 'Others', percentage: currentRemaining });
      }
      
      return results;
  };

  // --- Election Trends (2011, 2016, 2021) ---
  const trend2011Winner = region === 'Western' || region === 'Central' ? 'NRM' : 'NRM';
  const trend2011Share = 60 + Math.random() * 20;
  
  const trend2016Winner = region === 'Central' ? 'DP' : 'NRM'; 
  if (region === 'Eastern' && /soroti|kumi/.test(constituencyLower)) {
     // FDC was strong here
  }
  const trend2016Share = 55 + Math.random() * 10;
  
  const trend2021Winner = prevWinner;
  const trend2021Share = 48 + Math.random() * 12;

  const electionTrend: ElectionTrend[] = [
    { 
        year: 2011, 
        winningParty: trend2011Winner, 
        voteShare: trend2011Share, 
        turnout: 72, 
        margin: 12,
        results: generateBreakdown(trend2011Winner, trend2011Share)
    },
    { 
        year: 2016, 
        winningParty: trend2016Winner, 
        voteShare: trend2016Share, 
        turnout: 68, 
        margin: 8,
        results: generateBreakdown(trend2016Winner, trend2016Share)
    },
    { 
        year: 2021, 
        winningParty: trend2021Winner, 
        voteShare: trend2021Share, 
        turnout: 65, 
        margin: 5,
        results: generateBreakdown(trend2021Winner, trend2021Share)
    }
  ];

  // --- Candidate History Simulation ---
  const candidateHistory: CandidatePastResult[] = [];
  
  if (candidateName) {
    const isIncumbent = candidateParty === prevWinner;
    
    if (isIncumbent) {
       candidateHistory.push({ year: 2021, position: 'Member of Parliament', outcome: 'Won', party: candidateParty || 'Independent', votes: 24000 + Math.floor(Math.random()*5000) });
       if (Math.random() > 0.5) {
          candidateHistory.push({ year: 2016, position: 'Member of Parliament', outcome: 'Won', party: candidateParty || 'Independent', votes: 21000 });
       }
    } else {
       candidateHistory.push({ year: 2021, position: 'Member of Parliament', outcome: 'Lost', party: candidateParty || 'Independent', votes: 12000 + Math.floor(Math.random()*8000) });
    }
  }

  // --- Social Media Poll Data ---
  const sentimentBase = candidateParty === prevWinner ? 60 : 40; 
  const positive = Math.min(90, Math.floor(Math.random() * 30) + sentimentBase);
  const negative = Math.min(90, Math.floor(Math.random() * 25) + (100 - sentimentBase - 20));
  const neutral = Math.max(0, 100 - positive - negative);
  
  const topics = ['Infrastructure', 'Youth Jobs', 'Health Services', 'Security', 'Education', 'Land Rights', 'Taxes', 'Corruption'].sort(() => 0.5 - Math.random()).slice(0, 3);

  const socialMediaPoll: SocialMediaPoll = {
    sentiment: { positive, neutral, negative },
    totalMentions: Math.floor(Math.random() * 15000) + 1200,
    trendingTopics: topics
  };

  // --- OSINT Background Data ---
  const maritalStatus = Math.random() > 0.3 ? 'Married' : 'Single';
  const educationLevels = ['Bachelor of Laws (Makerere University)', 'Masters in Public Administration', 'Bachelor of Social Sciences', 'PhD in Economics', 'Diploma in Education', 'Bachelor of Commerce'];
  const education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
  
  const lifestyleProfiles = [
    'Maintains a high-profile social presence, often seen at upscale venues. Owns significant real estate.',
    'Low-key, grassroots-focused lifestyle. Primarily resides in the constituency and engages in farming.',
    'Technocratic background, splits time between consultancy work and constituency visits.',
    'Business-oriented, owns a chain of local businesses. Frequently sponsors local sports.'
  ];
  const lifestyle = lifestyleProfiles[Math.floor(Math.random() * lifestyleProfiles.length)];
  
  const possibleControversies = [
    'Cited in 2019 Auditor General report for unaccounted funds.',
    'Alleged involvement in local land boundary dispute.',
    'Viral video incident involving police altercation.',
    'Accused of academic document forgery in previous petition.',
    'Linked to controversial procurement deal.',
    'Clean public record with no major scandals reported.'
  ];
  const controversies = Math.random() > 0.6 
    ? [possibleControversies[Math.floor(Math.random() * (possibleControversies.length - 1))]] 
    : [possibleControversies[possibleControversies.length - 1]];

  const analysisTemplates = [
    `As a ${candidateParty} candidate in a ${region} constituency, ${candidateName?.split(' ')[0]} faces a competitive race. Rising youth unemployment in trading centers poses a risk.`,
    `${candidateName?.split(' ')[0]} is leveraging strong grassroots networks. However, the ${candidateParty} brand is facing scrutiny here due to service delivery delays.`,
    `A polarized electorate makes this a toss-up. ${candidateName?.split(' ')[0]}'s alignment with regional brokers provides stability, but opposition sentiment is growing.`,
    `Positioned as a reformer, ${candidateName?.split(' ')[0]} is attracting undecided voters. The main challenge remains mobilizing the youth vote.`
  ];
  const politicalAnalysis = analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];

  const osintBackground: OSINTBackground = {
    maritalStatus,
    education,
    lifestyle,
    controversies,
    politicalAnalysis
  };

  // --- Campaign Strategy & News Feed Generation ---
  let newsItems: NewsItem[] = [];
  let challenges: string[] = [];
  let strategy = "";
  const lastName = candidateName?.split(' ').pop() || "Candidate";
  const today = new Date();
  const dates = [
    new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  ];

  if (candidateParty === 'NRM') {
    newsItems = [
      { headline: `${lastName} Launches Parish Dev. Model`, source: 'New Vision', date: dates[0], snippet: `MP ${lastName} distributed PDM funds to 50 beneficiary groups.` },
      { headline: 'Road Infrastructure Pledge Renewed', source: 'Radio West', date: dates[1], snippet: 'Candidate promised completion of the connector road before next rainy season.' },
      { headline: 'Donation to Local Health Center IV', source: 'Local Feed', date: dates[2], snippet: `Delivered 20 hospital beds to the district health center.` }
    ];
    challenges = ['Voter fatigue with incumbency', 'Allegations of unfulfilled past pledges', 'Internal party primary friction'];
    strategy = "Leverage government achievements in infrastructure. Focus heavily on rural mobilization. Address youth unemployment directly.";
  } else if (candidateParty === 'NUP') {
    newsItems = [
      { headline: `Police Block ${lastName}'s Rally Venue`, source: 'Daily Monitor', date: dates[0], snippet: `Security forces dispersed supporters attempting to gather.` },
      { headline: 'Youth Wing Endorses Candidacy', source: 'Social Media', date: dates[1], snippet: 'Local youth leaders issued a joint statement backing the campaign.' },
      { headline: `${lastName} Criticizes Hospital Conditions`, source: 'NBS TV', date: dates[2], snippet: `Viral video shows candidate exposing lack of medicine.` }
    ];
    challenges = ['Restrictions on freedom of assembly', 'Financial constraints', 'Intimidation of polling agents'];
    strategy = "Maximize social media dominance. Focus on urban centers and youth vote. Use 'victimhood' narrative regarding rally blocks.";
  } else if (candidateParty === 'FDC' || candidateParty === 'UPC') {
    newsItems = [
      { headline: `${lastName} Calls for Party Unity`, source: 'The Observer', date: dates[0], snippet: `Urged local delegates to remain focused on the constituency win.` },
      { headline: 'Consultative Meeting Held', source: 'Local Radio', date: dates[1], snippet: 'Discussed high tax burdens with local traders association.' },
      { headline: 'Defection Rumors Denied', source: 'Twitter', date: dates[2], snippet: `Campaign manager issued statement refuting claims of defection.` }
    ];
    challenges = ['National party factionalism', 'Squeezed between NRM and NUP', 'Funding shortages'];
    strategy = "Consolidate the traditional opposition base. Focus on policy competence and experience. Target older opposition voters.";
  } else {
    newsItems = [
      { headline: `${lastName} Campaigns on 'Service Not Politics'`, source: 'Community Radio', date: dates[0], snippet: `Independent candidate emphasizes personal track record.` },
      { headline: 'Bursary Scheme Launched', source: 'Education News', date: dates[1], snippet: 'Sponsored 50 scholarships for secondary students.' },
      { headline: 'Community Water Project Commissioned', source: 'Local Feed', date: dates[2], snippet: `Privately funded borehole opened in the parish.` }
    ];
    challenges = ['Lack of party machinery', 'Voters identifying with party symbols', 'Resource drain'];
    strategy = "Build a 'personal brand'. Focus on tangible, self-funded community projects. Form alliances with local opinion leaders.";
  }

  const campaignStrategy: CampaignStrategy = {
    latestNews: newsItems,
    keyChallenges: challenges,
    winningStrategy: strategy
  };

  return {
    constituency,
    region,
    demographics: {
      totalPopulation: totalPop.toLocaleString(),
      registeredVoters: Math.floor(totalPop * voterRate).toLocaleString(),
      youthPercentage: 75 + Math.floor(Math.random() * 10),
      urbanizationRate: isCity ? 80 + Math.floor(Math.random() * 15) : 5 + Math.floor(Math.random() * 25),
    },
    socioEconomic: {
      primaryActivity: activity,
      povertyIndex,
      literacyRate: literacy,
      accessToElectricity: electricity
    },
    historical: {
      previousWinner: prevWinner,
      margin2021: `${(Math.random() * 15 + 2).toFixed(1)}%`,
      voterTurnout: `${Math.floor(Math.random() * 20 + 50)}%`,
      incumbentStatus: Math.random() > 0.3 ? 'Defended' : 'Contested'
    },
    electionTrend,
    candidateHistory,
    socialMediaPoll,
    osintBackground,
    campaignStrategy
  };
};
