################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Each subdirectory must supply rules for building sources it contributes
remoteControlHTTP.cpp: ../remoteControlHTTP.ino
	@echo 'Building file: $<'
	@echo 'Invoking: Resource Custom Build Step'
	
	@echo 'Finished building: $<'
	@echo ' '

%.o: ./%.cpp $(GEN_OPTS) | $(GEN_HDRS)
	@echo 'Building file: $<'
	@echo 'Invoking: GNU Compiler'
	"C:/energia-0101E0017/hardware/tools/lm4f/bin/arm-none-eabi-gcc.exe" -c -mcpu=cortex-m4 -march=armv7e-m -mthumb -fno-exceptions -DF_CPU=80000000L -DENERGIA=17 -DARDUINO=101 -I"C:/energia-0101E0017/hardware/cc3200/variants/launchpad" -I"C:/energia-0101E0017/hardware/cc3200/cores/cc3200" -I"C:/Users/Jesus/Documents/ICOM5047/CC3200/remoteControlHTTP" -I"C:/energia-0101E0017/hardware/cc3200/libraries/WiFi" -I"C:/energia-0101E0017/hardware/tools/lm4f/arm-none-eabi/include" -Os -ffunction-sections -fdata-sections -g -gdwarf-3 -gstrict-dwarf -Wall -MMD -MP -MF"$(@:%.o=%.d)" -MT"$(@)" -fno-rtti -o"$@" $(GEN_OPTS__FLAG) "$<"
	@echo 'Finished building: $<'
	@echo ' '


