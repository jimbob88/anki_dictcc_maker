from typing import Optional
import genanki
from fastapi import FastAPI
import uuid
import requests
import re
import os
from fastapi.responses import FileResponse

app = FastAPI()


@app.get("/")
async def read_root():
    return {"Hello": "World"}


def create_model(lang1: str, lang2: str):
    _id = int("".join([str(ord(lett)) for lett in lang1 + lang2]))
    model = genanki.Model(
        _id,
        f"Dictcc Vocab Model ({lang1}/{lang2})",
        fields=[
            {"name": f"{lang1}"},
            {"name": f"{lang1}_extras"},
            {"name": f"{lang2}"},
            {"name": f"{lang2}_extras"},
            {"name": "first_audiofile"},
            {"name": "second_audiofile"},
        ],
        templates=[
            {
                "name": "Card 1",
                "qfmt": "{{%s}}<br/>{{%s_extras}}<br/>{{first_audiofile}}"
                % (lang1, lang1),
                "afmt": "{{FrontSide}}<br/><hr id=answer><br/>{{%s}}<br/>{{%s_extras}}<br/>{{second_audiofile}}"
                % (lang2, lang2),
            },
            {
                "name": "Card 2",
                "afmt": "{{FrontSide}}<br/><hr id=answer><br/>{{%s}}<br/>{{%s_extras}}<br/>{{first_audiofile}}"
                % (lang1, lang1),
                "qfmt": "{{%s}}<br/>{{%s_extras}}<br/>{{second_audiofile}}"
                % (lang2, lang2),
            },
        ],
    )
    return (_id, model)


def download_file(url, location):
    headers = {
        "user-agent": "Mozilla/5.0 (X11; Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Raspbian Chromium/74.0.3729.157 Chrome/74.0.3729.157 Safari/537.36"
    }
    r = requests.get(url, headers=headers)
    with open(location, "wb") as f:
        f.write(r.content)


@app.get("/get-anki")
async def read_item(
    first_language: str,
    second_language: str,
    first_string: str,
    second_string: str,
    first_extras: str,
    second_extras: str,
    first_audio: Optional[str] = "",
    second_audio: Optional[str] = "",
):
    print(first_audio)
    print(second_audio)
    if first_audio.startswith("//"):
        first_audio = "https:" + first_audio
    if second_audio.startswith("//"):
        second_audio = "https:" + second_audio

    get_id_re = r"id=(\d+)"
    # _id1 = re.search(get_id_re, first_audio).group(1)
    # _id2 = re.search(get_id_re, second_audio).group(1)

    _deckid, anki_model = create_model(first_language, second_language)

    if not os.path.exists("audio_files"):
        os.makedirs("audio_files")

    d_uuid = str(uuid.uuid4())
    os.makedirs(f"audio_files/{d_uuid}")

    # second_audio_loc = (
    #    f"audio_files/{d_uuid}/{first_language}{second_language}_{_id2}.mp3"
    # )
    if first_audio:
        _id1 = re.search(get_id_re, first_audio).group(1)
        first_audio_loc = (
            f"audio_files/{d_uuid}/{first_language}{second_language}_{_id1}.mp3"
        )
        download_file(first_audio, first_audio_loc)
    else:
        first_audio_loc = ""
    if second_audio and second_audio != 'undefined':
        print(second_audio)
        _id2 = re.search(get_id_re, second_audio).group(1)
        second_audio_loc = (
            f"audio_files/{d_uuid}/{first_language}{second_language}_{_id2}.mp3"
        )
        download_file(second_audio, second_audio_loc)
    else:
        second_audio_loc = ""
    anki_note = genanki.Note(
        model=anki_model,
        fields=[
            first_string,
            first_extras,
            second_string,
            second_extras,
            f"[sound:{first_audio_loc.split('/')[-1]}]",
            f"[sound:{second_audio_loc.split('/')[-1]}]",
        ],
    )

    deck = genanki.Deck(_deckid, f"Dict.cc Vocab ({first_language}-{second_language})")
    deck.add_note(anki_note)

    pkg = genanki.Package(deck)
    if first_audio_loc and second_audio_loc:
        print("Added both audio files")
        pkg.media_files = [first_audio_loc, second_audio_loc]
    elif first_audio_loc:
        print("Added first")
        pkg.media_files = [first_audio_loc]
    elif second_audio_loc:
        print("Added second", pkg.media_files)
        pkg.media_files = [second_audio_loc]
        print(pkg.media_files)
 
    if not os.path.exists(f"created_packages/{d_uuid}"):
        os.makedirs(f"created_packages/{d_uuid}")
    file_location = f"created_packages/{d_uuid}/package.apkg"
    pkg.write_to_file(file_location)

    return FileResponse(file_location, media_type="application/octet-stream", filename="package.apkg"
    )
