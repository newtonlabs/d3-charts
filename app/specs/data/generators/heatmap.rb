#!/usr/bin/env ruby

colors     = ['#d3e0f2', '#a8c1e5', '#6691d2', '#2563bf']
categories = ['Alpha', 'Beta', 'Gama', 'Omega', 'Zulu']
xAxis      = ['Atlantic', 'Midwest', 'Northeast', 'South', 'West']
yAxis      = ['Metric 1 That is very very very long', 'Metric 2', 'Metric 3', 'Metric 4', 'Metric 5']

puts "category,xAxis,yAxis,value,trend,target,color,ID"
categories.each do |category|
  yAxis.each do |metric|
    xAxis.each do |region|
      value = rand(200)
      puts "#{category},#{region},#{metric},#{value},null,null,#{colors[rand(4)]}"
    end
  end
end



