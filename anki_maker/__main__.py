import genanki
import os
import re
import requests


input_data = input("Tampermonkey Output: ").split('¬')
print(input_data)

vocab_model = genanki.Model(
    1607332319,
    'Dictcc Vocab Model',
    fields=[
        {'name': 'eng'},
        {'name': 'eng_extra'},
        {'name': 'de'},
        {'name': 'de_extra'},
        {'name': 'audiofile'}
    ],
    templates=[
        {
            'name': 'Card 1',
            'qfmt': '{{eng}}<br/>{{eng_extra}}',
            'afmt': '{{de}}<br/>{{de_extra}}<br/>{{audiofile}}'
        },
        {
            'name': 'Card 2',
            'afmt': '{{eng}}<br/>{{eng_extra}}',
            'qfmt': '{{de}}<br/>{{de_extra}}<br/>{{audiofile}}'
        }
    ]
)

if len(input_data[-1]) < 5:
    raise ValueError("That url doesn't look right")
elif not len(input_data) == 5:
    raise ValueError("That doesn't look right to me")

input_data = [i.strip() for i in input_data]
if input_data[-1].startswith('//'):
    input_data[-1] = 'https:' + input_data[-1]

if not os.path.exists('audio_files'):
    os.makedirs('audio_files')

get_id_re = r"id=(\d+)"
_id = re.search(get_id_re, input_data[-1]).group(1)

print("Downloading audio file")
# wget.download(input_data[-1], f'audio_files/deen_{_id}.mp3')
headers = {
        'user-agent': 'Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Raspbian Chromium/74.0.3729.157 Chrome/74.0.3729.157 Safari/537.36'
}
r = requests.get(input_data[-1], headers=headers)
with open(f'audio_files/deen_{_id}.mp3', 'wb') as f:
    f.write(r.content)



print("\nCreating anki card")
note = genanki.Note(
        model=vocab_model,
        fields=[
            input_data[0],
            input_data[1],
            input_data[2],
            input_data[3],
            f'[sound:deen_{_id}.mp3]'
            ]
)

deck = genanki.Deck(
  2059400110,
  'Dict.cc Vocab (DE-EN)')
deck.add_note(note)

pkg = genanki.Package(deck)
pkg.media_files = [f'audio_files/deen_{_id}.mp3']
pkg.write_to_file('output.apkg')

print(f"Packaged created at: {os.path.join(os.getcwd(), 'output.apkg')}")
