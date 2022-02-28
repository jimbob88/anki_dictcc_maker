# Anki Dict.cc Maker
## Setup

### Python Area
```
git clone https://github.com/jimbob88/anki_dictcc_maker.git
cd anki_dictcc_maker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Tampermonkey Setup

#### 1. Get Tampermonkey

Head to the [tampermonkey website](https://www.tampermonkey.net/) and get the Tampermonkey extension for your system.

#### 2. Get the UserScript
 - Press the TamperMonkey symbol (most likely in the top left of your screen) and click "Dashboard".

 - Press the Utilities tab (on the left hand side)

 - Paste the [github raw link](https://raw.githubusercontent.com/jimbob88/anki_dictcc_maker/main/tampermonkey.js) into the "Import from URL" section!

#### 3. Go to dict.cc and perform a search
Go to a dictionary section on dict.cc ([example](https://www.dict.cc/?s=soon))

#### 4. Insert Script
Right-click on the page and go to "TamperMonkey --> 'Dict.cc -> Anki Convertor' "

#### 5. Play Audio
Go to the row that you want to download, and click the speaker symbol and select the audio file you want. Now press the new "Anki Button"

#### 6. Copy code to python
Run the Python code:

```
python -m anki_maker
```

Paste the code from the "Alert"

# FastAPI

Test Url:
```
https://ankidictccmaker.jimbob888.repl.co/get-anki/?first_language=EN&second_language=DE&first_string=soon&second_string=bald&first_extras=adv&second_extras=adv&second_audio=//audio.dict.cc/speak.audio.v2.php%3Ferror_as_text%3D1%26type%3Dmp3%26id%3D1468372%26lang%3Dde_rec_ip%26lp%3DDEEN
```
