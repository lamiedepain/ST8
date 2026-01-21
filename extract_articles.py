#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import openpyxl
import json

wb = openpyxl.load_workbook('magasin_st8/magasin.xlsx', read_only=True, data_only=True)
ws = wb.active

articles = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[0] and row[1]:
        articles.append({
            'code': str(row[0]),
            'description': str(row[1])
        })

wb.close()

with open('articles_magasin.json', 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Extraction terminée : {len(articles)} articles")
