#!/usr/bin/env ruby

t = 0.00
delta_t = 0.01
amplitude = 1
w = Math::PI * 2
f = 1/1
today = Time.now

# teams  = (1..7).collect{|i| "Team #{i}"}
# kips   = (1..7).collect{|i| "Kip #{i}"}

def color(value)
  colors = ['#2C7FB8', '#7FCDBB', '#D95F0E']
  if (value > 25)
    return colors.first
  elsif(value <= 25 && value >= -25)
    return colors[1]
  else
    return colors.last
  end
end

puts "category,xAxis,yAxis,value,trend,target,color,ID"
0.upto(5) do |i|
  today = Time.now
  (i + 100).upto(1800+100) do |x|
    t += delta_t
    today += (60*60*24)
    stamp = today.strftime("%Y%m%d")
    value = amplitude * Math.sin(w * t) * 100
    puts "Team #{i},#{stamp},Net Promoter Score,#{sprintf('%.2f',value)},null,25,#{color(value)},#{x}"
  end
end
