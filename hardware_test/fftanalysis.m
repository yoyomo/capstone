close all

sizeVncell = size(Vn005);
sizeVncell = sizeVncell(1)

for i = 1:sizeVncell
    newChr = strrep(Vn005(i,1),',',' ');

    newChr = strrep(newChr,'(','');

    newChr = strrep(newChr,')','');
    newChr = strrep(newChr,'dB','');
    newChr = strrep(newChr,'°','');
    spacecell = strfind(newChr,' ');
    space = cell2mat(spacecell);
    newChr = newChr {1};
    newChr = newChr(1:space);
    
    vout(i,1) = str2double(newChr);
end

 VOUT = vout(50:90);
 VOUTpower = db2pow(VOUT);
 voutp= db2pow(vout);
 mag = db2mag(vout);
 Mag5 = db2mag(VOUT);
 
 f = Freq(50:90);
figure
plot(Freq,vout)
title('db Vs. Frequency')
xlabel('Freq. Hz') % x-axis label
ylabel('db') % y-axis label

figure
plot(f,VOUT)
title('db Vs. Freq. Zoom(50-90Hz)')
xlabel('Freq. Hz') % x-axis label
ylabel('db') % y-axis label

%figure
%plot(Freq,voutp)
figure
plot(Freq,mag)
title('Magnitude Vs. Freq.')
xlabel('Freq. Hz') % x-axis label
ylabel('Magnitude') % y-axis label


figure
plot(f,Mag5)
title('Magnitude Vs. Freq. (50-90Hz)')
xlabel('Freq. Hz') % x-axis label
ylabel('Magnitude') % y-axis label
