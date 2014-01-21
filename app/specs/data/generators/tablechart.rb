#!/usr/bin/env ruby

colors     = ['#d3e0f2', '#a8c1e5', '#6691d2', '#2563bf']
categories = ['Gouverneur', 'Jacobi', 'Lincoln', 'Metropolitan', 'Kings']
sub_categories = ['3rd Next Available New', '3rd Next Avail Rvst', 'Fill Rate', 'No Show Rate', 'In-Clinic Wait Time', 'Patient Satisfaction', 'Total Patients Seen']
# xAxis      = ['Atlantic', 'Midwest', 'Northeast', 'South', 'West']
# values
yAxis      = ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4', 'Metric 5']

puts "category,subcategory,xAxis,value,color,target"
categories.each do |category|
  sub_categories.each do |sub_category|
    today = Time.now
    14.times do |x|
      today += (60*60*24)
      stamp = today.strftime("%Y%m%d")
      value = rand(100)
      color = colors[rand(colors.length)]
      puts "#{category},#{sub_category},#{stamp},#{value},#{color},50"
    end
  end
end



