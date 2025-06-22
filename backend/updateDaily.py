import csv
import os
from google import genai
from datetime import date


def merge_today_into_past():
    today_path = os.path.join(os.path.dirname(__file__), "today.csv")
    past_path = os.path.join(os.path.dirname(__file__), "pastData.csv")
    # Read today.csv into a dict: english -> row data
    today_data = {}
    with open(today_path, newline='', encoding='utf-8') as today_file:
        reader = csv.reader(today_file)
        next(reader, None)  # Skip header/date line
        for row in reader:
            if len(row) < 5 or not row[0].strip() or row[0].startswith('//'):
                continue
            english = row[0].strip()
            today_data[english] = row  # [english, french, meaning, pronunciation, frequency]
    # Read pastData.csv into a dict: english -> row data
    past_data = {}
    if os.path.exists(past_path):
        with open(past_path, newline='', encoding='utf-8') as past_file:
            reader = csv.reader(past_file)
            next(reader, None)
            for row in reader:
                if len(row) < 6 or not row[0].strip() or row[0].startswith('//'):
                    continue
                english = row[0].strip()
                past_data[english] = row  # [english, french, meaning, pronunciation, frequency, dayssince]
    # Merge: update dayssince and frequency, prefer today's data if duplicate
    merged = {}

    # First, update past data
    for english, row in past_data.items():
        if english in today_data:
            # Merge: prefer today's translation, add frequencies, dayssince=1
            today_row = today_data[english]
            freq = int(row[4]) + int(today_row[4])
            merged[english] = today_row[:4] + [str(freq), '1']
            del today_data[english]
        else:
            # Increment dayssince
            dayssince = int(row[5]) + 1
            merged[english] = row[:5] + [str(dayssince)]
    # Add new words from today_data
    for english, row in today_data.items():
        merged[english] = row[:5] + ['1']
    # Write merged data to pastData.csv
    with open(past_path, 'w', newline='', encoding='utf-8') as past_file:
        writer = csv.writer(past_file)
        writer.writerow(['english','translated','meaning','pronunciation','frequency','dayssince'])
        for row in merged.values():
            writer.writerow(row)


def updateDaily(level, target_language):
    merge_today_into_past

    client = genai.Client(api_key=[enter dev key here])

    today_path = os.path.join(os.path.dirname(__file__), "today.csv")
    past_path = os.path.join(os.path.dirname(__file__), "pastData.csv")
    data = []

    # Check if pastData.csv exists and if language matches; if not, reset to headers
    reset_past = False
    if os.path.exists(past_path):
        with open(past_path, encoding='utf-8') as f:
            lines = f.readlines()
            if len(lines) > 0:
                parts = lines[0].strip().split(',')
                if len(parts) > 1 and parts[1].strip() != target_language:
                    reset_past = True
            else:
                reset_past = True
    else:
        reset_past = True

    if reset_past:
        with open(past_path, "w", encoding="utf-8") as f:
            f.write("english,translated,meaning,pronunciation,frequency,dayssince\n")

    with open(past_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader)
        for row in reader:
            if len(row) >= 6:
                data.append(f"({row[0]}, {row[4]}, {row[5]})")
    csv_str = ', '.join(data)

    num = 15
    if level=='intermediate':
        num = 50
    elif level=='advanced':
        num = 100
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite-preview-06-17",
        contents=f"""You are generating a **CSV snippet—no header, no commentary**—to update a learner’s word list for {target_language}.  
The learner needs **exactly {num} common nouns** at **{level}** difficulty.

─────────────────
CONTEXT  (do NOT output)
The first value in each row MUST be the English word.
The second is the Translation in {target_language}.
Do NOT reverse this order. It must be:

English,Translation,Meaning,Pronunciation,Frequency

{csv_str}
─────────────────

SELECTION RULES  
1.  If *DaysSince* is low **AND** *Freq* is low ➜ include the word (high priority).  
2.  If *Freq* is high ➜ exclude the word.  
3.  Otherwise choose a suitable new noun not in the list.  
4.  Avoid duplicates.  Return exactly {num} rows.

OUTPUT FORMAT (strict)  
• Comma-separated, **no header row**.  
• Column order **exactly**:  
  `English,Translation,Meaning(max 8 words),Pronunciation(Pro-Nun-See-A-Shun style),Frequency`  
• Set **Frequency** to `0` for every row.  
• One row per line, no extra spaces.

Any deviation from the order or format will break downstream code.  
Return only the CSV rows—nothing else.

Here is an example of the correct row format:

book,livre,collection of written pages,BUHK,0

This row means:
- English word: book
- Translation: livre (in French)
- Meaning: collection of written pages
- Pronunciation: BUHK
- Frequency: 0

Use this format for all rows.
⚠️ The first column must be the ENGLISH word.
⚠️ The second column must be its TRANSLATION in {target_language}.

Before you finalise your answer, make sure that you are putting English first, translation next. English first, translation next.
"""

    )
    print(response.text)

    with open(today_path, "w", encoding="utf-8") as f:
        f.write(f"{date.today()},{target_language},{level},,\n")
        lines = response.text.strip().split('\n')
        if lines and (lines[0].rstrip().endswith(',0') or lines[0].rstrip().endswith(', 0')):
            f.write(response.text)
        else:
            lines = [line.rstrip() + ',0' for line in lines if line.strip()]
            f.write('\n'.join(lines))













