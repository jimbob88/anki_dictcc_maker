import genanki
import os

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

