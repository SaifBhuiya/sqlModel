# CRUD_APP (sqlModel)
 
This was my first time with the term "CRUD". 

I have learned SQL in university but never used it with a backend. We used xampp in uni. However, I opted for MYSQL for this project. The knowledge of how queries work helped. Intially I didnt want to change the dataset provided and was following some video guides. The guide I was following did front end processing of data without permanent change in database. I didnt know much about how modern sites do it so I thought this was the norm and went with it. As I was adding new features things started getting more complex and I realised it was too complex to be the norm. So after further research I realised that changing database as you go is a better way to do it. So I rewrote the logic to now incorporate changes in database. So create, delete and edit actually changed dataset. 

The intial data set didnt have a unique value to be used as primary key and I thought I'd try to find a workaround instead of adding it myself. I did manage to make a lot of the features work and found workarounds but then the codes were longer and some features weren't working as intended. Solving those would have wasted time and I could easily avoid those isssues if I just had a primary key. So I finally added a column 'id' as primary key to make things way easier. And turns out there is an Autoincrement system in MYSQL which does everything for you. So I cleaned the code to incorporate the primary key.

All the phases of development did help me learn more about the API calls. I learned a lot about get, put, post and delete. Connecting SQL with python was confusing at first but then I got used to it. One error that kept popping up was CORS. I looked up a few things about it and the first impression was that it was a permission problem which was solved by including a library in the code. But then this kept popping even when I had the thing settled. Then I realized, incorrect code was also causing this. So then I started writing my code in sections and testing them before going to the next section.

On the ReactJs side of things, this project helped me understand how keywords like async, fetch, .then etc work. 

The hardest part however was actually looking for a cloud service to host these. Took me a long time to find something that works and then configuring files to make them work. But finally I got that to work too.
