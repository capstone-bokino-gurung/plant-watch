import { StyleSheet, View } from 'react-native';

import { LoginScreen } from '@/components/login-screen';
import { RegisterScreen } from '@/components/register-screen';
import { BackButton } from '@/components/ui/back-button';
import { useState } from "react";

export default function Profile() {
    const screens = {
      LOGIN: "login",
      REGISTER: "register",
  };

  const [currScreen, setScreen] = useState(screens.LOGIN);

  if (currScreen == "login") {
    return (<LoginScreen createAccountOnPress={() => setScreen(screens.REGISTER)}/>);
  } else if (currScreen == "register") {
    return(
      <View style={styles.flexContainer}>
        <BackButton onPress={() => setScreen(screens.LOGIN)}/>  
        <RegisterScreen/>
      </View>
    );

  } else {  
    return (<LoginScreen createAccountOnPress={() => setScreen(screens.REGISTER)}/>);
  }

}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
});
