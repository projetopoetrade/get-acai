import requests
import json
import time

def buscar_bairros_camacari():
    # Camaçari possui diversos CEPs. Vamos buscar por nomes de ruas comuns para extrair os bairros.
    # Termos de busca para cobrir a maior parte da cidade
    termos = ["Avenida", "Rua", "Praca", "Loteamento"]
    bairros_encontrados = set()
    uf = "BA"
    cidade = "Camacari"

    print(f"Iniciando busca de bairros em {cidade}...")

    for termo in termos:
        try:
            url = f"https://viacep.com.br/ws/{uf}/{cidade}/{termo}/json/"
            response = requests.get(url)
            
            if response.status_code == 200:
                dados = response.json()
                for item in dados:
                    if item.get('bairro'):
                        bairros_encontrados.add(item['bairro'])
            
            # Respeitar o limite da API do ViaCEP
            time.sleep(1)
        except Exception as e:
            print(f"Erro ao buscar termo {termo}: {e}")

    return sorted(list(bairros_encontrados))

def gerar_payload(lista_bairros):
    payload = []
    for bairro in lista_bairros:
        payload.append({
            "name": bairro,
            "customDeliveryFee": 5.0, # Sua taxa padrão definida
            "estimatedTime": "30-45 min",
            "active": True,
            "notes": "Cadastrado via automação ViaCEP"
        })
    return payload

# Execução
bairros = buscar_bairros_camacari()
if bairros:
    resultado = gerar_payload(bairros)
    
    with open('bulk_bairros_camacari.json', 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    
    print(f"Sucesso! {len(bairros)} bairros encontrados e salvos em 'bulk_bairros_camacari.json'.")
else:
    print("Nenhum bairro encontrado.")