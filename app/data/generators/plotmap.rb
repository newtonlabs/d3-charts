#!/usr/bin/env ruby

colors         = ['#d3e0f2', '#a8c1e5', '#6691d2', '#2563bf']
categories     = ['Alpha', 'Beta', 'Gama', 'Omega', 'Zulu']
sub_categories = ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4', 'Metric 5']
yAxis          = ['KIP 1', 'KIP 2', 'KIP 3', 'KIP 4', 'KIP 5']

puts "category,subcategory,yAxis,value,trend,target,color,ID"
categories.each do |category|
  sub_categories.each do |sub_category|
    yAxis.each do |axis|
      value = rand(200)
      puts "#{category},#{sub_category},#{axis},#{value}"
    end
  end
end



