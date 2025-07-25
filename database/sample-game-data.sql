-- Sample Game Data for MAKNA Heritage Sites
-- Insert overview content and trivia questions for Borobudur and Prambanan

-- Overview Content for Borobudur
INSERT INTO public.situs_overview (situs_uid, title, content, order_sequence) VALUES
('bc28eb34-ddae-4504-932d-7d45efda169e', 'Sejarah dan Asal Usul', 
'Candi Borobudur dibangun pada abad ke-8 Masehi (sekitar 750-850 M) pada masa pemerintahan Dinasti Syailendra. Candi ini merupakan mahakarya arsitektur Buddha yang mencerminkan kosmologi Buddha dalam bentuk mandala tiga dimensi. Pembangunannya memakan waktu sekitar 75 tahun dan melibatkan ribuan pekerja serta seniman ahli.', 1),

('bc28eb34-ddae-4504-932d-7d45efda169e', 'Arsitektur dan Simbolisme', 
'Borobudur terdiri dari 3 tingkat yang melambangkan tiga alam dalam kosmologi Buddha: Kamadhatu (alam nafsu), Rupadhatu (alam bentuk), dan Arupadhatu (alam tanpa bentuk). Candi ini memiliki 2.672 panel relief, 504 arca Buddha, dan 72 stupa yang tersebar di seluruh bangunan. Setiap detail memiliki makna filosofis yang mendalam.', 2),

('bc28eb34-ddae-4504-932d-7d45efda169e', 'Relief dan Cerita', 
'Panel-panel relief Borobudur menceritakan berbagai kisah Buddha, termasuk kehidupan Buddha Gautama (Lalitavistara), perjalanan pencarian kebenaran (Jataka dan Avadana), serta ajaran Buddha tentang karma dan reinkarnasi. Relief ini dibaca dengan cara pradaksina (berputar searah jarum jam) sebagai bentuk meditasi berjalan.', 3),

('bc28eb34-ddae-4504-932d-7d45efda169e', 'Penemuan Kembali dan Konservasi', 
'Setelah ditinggalkan selama berabad-abad, Borobudur ditemukan kembali oleh Sir Thomas Stamford Raffles pada tahun 1814. Upaya restorasi besar dilakukan pada tahun 1907-1911 dan 1973-1983 dengan bantuan UNESCO. Kini Borobudur menjadi Situs Warisan Dunia UNESCO dan simbol kebanggaan Indonesia.', 4),

('bc28eb34-ddae-4504-932d-7d45efda169e', 'Makna Spiritual dan Modern', 
'Bagi umat Buddha, Borobudur adalah tempat suci untuk bermeditasi dan mencari pencerahan. Arsitekturnya yang mengikuti pola mandala menciptakan pengalaman spiritual yang mendalam. Di era modern, Borobudur menjadi jembatan dialog antarbudaya dan simbol toleransi beragama di Indonesia.', 5);

-- Overview Content for Prambanan
INSERT INTO public.situs_overview (situs_uid, title, content, order_sequence) VALUES
('b862f681-baa9-4406-a303-8fad75ef480a', 'Keagungan Candi Hindu Terbesar', 
'Candi Prambanan atau Roro Jonggrang adalah kompleks candi Hindu terbesar di Indonesia dan salah satu yang terindah di Asia Tenggara. Dibangun pada abad ke-9 Masehi, candi ini didedikasikan untuk Trimurti Hindu: Brahma sang Pencipta, Wisnu sang Pemelihara, dan Siwa sang Pemusnah.', 1),

('b862f681-baa9-4406-a303-8fad75ef480a', 'Legenda Roro Jonggrang', 
'Menurut legenda, candi ini terkait dengan kisah Roro Jonggrang dan Bandung Bondowoso. Dikisahkan bahwa Bandung Bondowoso harus membangun 1000 candi dalam semalam untuk mempersunting Roro Jonggrang. Namun, Roro Jonggrang menggagalkan usaha tersebut dan dikutuk menjadi arca yang melengkapi candi ke-1000.', 2),

('b862f681-baa9-4406-a303-8fad75ef480a', 'Arsitektur dan Tata Letak', 
'Kompleks Prambanan terdiri dari 3 zona: zona dalam (candi utama), zona tengah (candi perwara), dan zona luar (tembok keliling). Candi utama setinggi 47 meter didedikasikan untuk Siwa, diapit candi Brahma dan Wisnu. Terdapat pula candi wahana (Nandi, Angsa, dan Garuda) yang menghadap ke candi utama.', 3),

('b862f681-baa9-4406-a303-8fad75ef480a', 'Relief Ramayana yang Memukau', 
'Dinding candi Prambanan dihiasi relief yang menceritakan epos Ramayana. Kisah ini mengisahkan perjalanan Rama untuk menyelamatkan Sita dari Rahwana. Relief ini dibaca dengan berputar searah jarum jam, menampilkan 42 panel cerita yang penuh makna tentang kebaikan melawan kejahatan.', 4),

('b862f681-baa9-4406-a303-8fad75ef480a', 'Warisan Budaya Dunia', 
'Pada tahun 1991, Prambanan ditetapkan sebagai Situs Warisan Dunia UNESCO berkat nilai sejarah, arsitektur, dan seninya yang luar biasa. Candi ini menjadi bukti kejayaan peradaban Hindu-Jawa dan kemampuan teknologi konstruksi masa lampau yang masih mengagumkan hingga kini.', 5);

-- Trivia Questions for Borobudur
INSERT INTO public.trivia_questions (situs_uid, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, order_sequence) VALUES

('bc28eb34-ddae-4504-932d-7d45efda169e', 
'Pada abad keberapa Candi Borobudur dibangun?', 
'Abad ke-7 Masehi', 'Abad ke-8 Masehi', 'Abad ke-9 Masehi', 'Abad ke-10 Masehi', 
'B', 'Candi Borobudur dibangun pada abad ke-8 Masehi (sekitar 750-850 M) pada masa pemerintahan Dinasti Syailendra.', 'easy', 1),

('bc28eb34-ddae-4504-932d-7d45efda169e', 
'Berapa jumlah tingkat utama pada Candi Borobudur?', 
'2 tingkat', '3 tingkat', '4 tingkat', '5 tingkat', 
'B', 'Borobudur memiliki 3 tingkat utama: Kamadhatu (alam nafsu), Rupadhatu (alam bentuk), dan Arupadhatu (alam tanpa bentuk).', 'easy', 2),

('bc28eb34-ddae-4504-932d-7d45efda169e', 
'Siapa yang menemukan kembali Candi Borobudur pada tahun 1814?', 
'Sir Thomas Stamford Raffles', 'Sir Winston Churchill', 'Sir James Cook', 'Sir Francis Drake', 
'A', 'Sir Thomas Stamford Raffles, Gubernur Jenderal Inggris untuk Jawa, menemukan kembali Borobudur pada tahun 1814.', 'medium', 3),

('bc28eb34-ddae-4504-932d-7d45efda169e', 
'Berapa jumlah arca Buddha yang terdapat di Candi Borobudur?', 
'404 arca', '504 arca', '604 arca', '704 arca', 
'B', 'Candi Borobudur memiliki 504 arca Buddha yang tersebar di berbagai tingkat candi.', 'medium', 4),

('bc28eb34-ddae-4504-932d-7d45efda169e', 
'Apa nama cara membaca relief di Borobudur dengan berputar searah jarum jam?', 
'Pradaksina', 'Parikrama', 'Mandala', 'Stupa', 
'A', 'Pradaksina adalah istilah untuk ritual berputar searah jarum jam sebagai bentuk penghormatan dan meditasi berjalan.', 'hard', 5);

-- Trivia Questions for Prambanan
INSERT INTO public.trivia_questions (situs_uid, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, order_sequence) VALUES

('b862f681-baa9-4406-a303-8fad75ef480a', 
'Candi Prambanan didedikasikan untuk Trimurti Hindu. Siapa saja ketiga dewa tersebut?', 
'Brahma, Wisnu, Indra', 'Brahma, Wisnu, Siwa', 'Siwa, Ganesha, Durga', 'Wisnu, Indra, Surya', 
'B', 'Trimurti adalah tiga dewa utama Hindu: Brahma (Pencipta), Wisnu (Pemelihara), dan Siwa (Pemusnah).', 'easy', 1),

('b862f681-baa9-4406-a303-8fad75ef480a', 
'Berapa tinggi candi utama Siwa di kompleks Prambanan?', 
'42 meter', '47 meter', '52 meter', '57 meter', 
'B', 'Candi Siwa yang merupakan candi utama memiliki tinggi 47 meter, menjadikannya yang tertinggi di kompleks Prambanan.', 'medium', 2),

('b862f681-baa9-4406-a303-8fad75ef480a', 
'Epos apa yang diceritakan dalam relief Candi Prambanan?', 
'Mahabharata', 'Ramayana', 'Arjunawiwaha', 'Bharatayudha', 
'B', 'Relief Candi Prambanan menceritakan epos Ramayana, kisah perjalanan Rama menyelamatkan Sita dari Rahwana.', 'easy', 3),

('b862f681-baa9-4406-a303-8fad75ef480a', 
'Nama lain Candi Prambanan adalah?', 
'Candi Loro Kidul', 'Candi Roro Jonggrang', 'Candi Sewu', 'Candi Plaosan', 
'B', 'Candi Prambanan juga dikenal sebagai Candi Roro Jonggrang, berdasarkan legenda putri yang dikutuk menjadi arca.', 'medium', 4),

('b862f681-baa9-4406-a303-8fad75ef480a', 
'Pada tahun berapa Candi Prambanan ditetapkan sebagai Situs Warisan Dunia UNESCO?', 
'1989', '1991', '1993', '1995', 
'B', 'Candi Prambanan ditetapkan sebagai Situs Warisan Dunia UNESCO pada tahun 1991 berkat nilai sejarah dan arsitekturnya.', 'hard', 5); 