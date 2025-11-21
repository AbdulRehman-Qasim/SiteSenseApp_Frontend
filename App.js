import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { StripeProvider } from '@stripe/stripe-react-native'; // ✅ Add this

// Screens
import SplashScreen from './screens/SplashScreen';
import FeatureScreen from './screens/FeatureScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import OtpVerificationScreen from './screens/OtpVerificationScreen';
import OtpInputScreen from './screens/OtpInputScreen';
import MainScreen from './screens/MainScreen';
import HomeHelpScreen from './screens/HomeHelpScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import PreviousChatScreen from './screens/PreviousChatScreen';
import NewPasswordScreen from "./screens/NewPasswordScreen";
import MenuScreen from './screens/MenuScreen';
import UploadChecklistScreen from './screens/UploadChecklistScreen';
import SpecialInstructionScreen from './screens/SpecialInstructionScreen';
import ChecklistPreview from './screens/ChecklistPreview';
import SubscriptionScreen from './screens/SubscriptionScreen';
import PaymentScreen from './screens/PaymentScreen';
import ConfirmPaymentScreen from './screens/ConfirmPaymentScreen';
import StartInspectionScreen from './screens/StartInspectionScreen';
import AboutScreen from './screens/AboutScreen';
import HelpScreen from './screens/HelpScreen';
import ProjectScreen from './screens/ProjectScreen';
import ChecklistDetailScreen from './screens/ChecklistDetailsScreen';
import EditChecklist from './screens/EditChecklist';
import ReportScreen from './screens/ReportScreen';
import Reports from './screens/Reports';
import ReportViewerScreen from './screens/ReportViewerScreen';
import ProjectDetailScreen from './screens/ProjectDetailScreen';
import ReportViewScreen from './screens/ReportViewScreen';
import HomeScreen from './screens/HomeScreen';
import AiChecklistScreen from './screens/AiChecklistScreen';
import ChecklistsScreen from './screens/ChecklistsScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // <StripeProvider publishableKey="pk_test_51S2nIRPqI1h6KQX6aC4P4Tgyl5HkJmyTsV7pC6Tn9GT8iW4IhVC4f3UD2PztnA23FNyNzuC3k88mDGGLxWQYSSKt00XWd7tmgM"> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Feature" component={FeatureScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OtpInput" component={OtpInputScreen} />
          <Stack.Screen name="OTPVerification" component={OtpVerificationScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="HomeHelp" component={HomeHelpScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="PreviousChat" component={PreviousChatScreen} />
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          <Stack.Screen name="UploadChecklist" component={UploadChecklistScreen} />
          <Stack.Screen name="SpecialInstruction" component={SpecialInstructionScreen} />
          <Stack.Screen name="ChecklistPreview" component={ChecklistPreview} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} />
          <Stack.Screen name="StartInspection" component={StartInspectionScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="Projects" component={ProjectScreen} />
          <Stack.Screen name="ChecklistDetail" component={ChecklistDetailScreen} />
          <Stack.Screen name="EditChecklist" component={EditChecklist} />
          <Stack.Screen name="ReportScreen" component={ReportScreen} />
          <Stack.Screen name="Reports" component={Reports} />
          <Stack.Screen name="ReportViewer" component={ReportViewerScreen} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
          <Stack.Screen name="ReportView" component={ReportViewScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AiChecklist" component={AiChecklistScreen} />
          <Stack.Screen name="Checklists" component={ChecklistsScreen} />


        </Stack.Navigator>
      </NavigationContainer>
    // </StripeProvider>
  );
}
