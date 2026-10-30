import utils
import read_csv
import charts
import pandas as pd

def run():
  '''
  data = read_csv.read_csv('data.csv') # leemos el csv, gracias al módulo línea 2
  data = list(filter(lambda item : item['Continent'] == 'South America',data))
  countries = list(map(lambda x: x['Country'], data))
  percentages = list(map(lambda x: float(x['World Population Percentage']), data))
  charts.generate_pie_chart(countries, percentages)
  '''
  # Usamos Pandas
  df = pd.read_csv('data.csv')
  df = df[df['Continent'] == 'South America']
  countries = df['Country'].values
  percentages = df['World Population Percentage'].values.astype(float) 

  charts.generate_pie_chart(countries, percentages)

  data = read_csv.read_csv('data.csv') 
  country = input('Type Country => ')
  print(country)

  result = utils.population_by_country(data, country)

  if len(result) > 0:
    country = result[0]
    print(country_data)
    labels, values = utils.get_population(country_data)
    charts.generate_bar_chart(country_data['Country'], labels, values)

if __name__ == '__main__':
  run()
