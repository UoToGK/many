#requires -Version 2 -Modules posh-git

function Write-Theme {
    param(
        [bool]
        $lastCommandFailed,
        [string]
        $with
    )

    $prompt += Set-Newline
    # -------------------- 第一行 --------------------
    # 第一部分: 上次运行错误 + 管理员身份 + 用户@主机
    $prompt = Write-Prompt -Object $sl.PromptSymbols.StartSymbol -ForegroundColor $sl.Colors.PromptForegroundColor -BackgroundColor $sl.Colors.SessionInfoBackgroundColor
    #check the last command state and indicate if failed
    If ($lastCommandFailed) {
        $prompt += Write-Prompt -Object "$($sl.PromptSymbols.FailedCommandSymbol) " -ForegroundColor $sl.Colors.CommandFailedIconForegroundColor -BackgroundColor $sl.Colors.SessionInfoBackgroundColor
    }
    #check for elevated prompt
    If (Test-Administrator) {
        $prompt += Write-Prompt -Object "$($sl.PromptSymbols.ElevatedSymbol) " -ForegroundColor $sl.Colors.AdminIconForegroundColor -BackgroundColor $sl.Colors.SessionInfoBackgroundColor
    }
    $user = [System.Environment]::UserName
    $computer = [System.Environment]::MachineName
    $path = Get-FullPath -dir $pwd
    if (Test-NotDefaultUser($user)) {
        $prompt += Write-Prompt -Object "$user@$computer " -ForegroundColor $sl.Colors.SessionInfoForegroundColor -BackgroundColor $sl.Colors.SessionInfoBackgroundColor
    }

    # 第二部分: 路径
    $prompt += Write-Prompt -Object $sl.PromptSymbols.SegmentForwardSymbol -ForegroundColor $sl.Colors.SessionInfoBackgroundColor -BackgroundColor $sl.Colors.PromptBackgroundColor
    # Writes the drive portion
    $prompt += Write-Prompt -Object "$path " -ForegroundColor $sl.Colors.PromptForegroundColor -BackgroundColor $sl.Colors.PromptBackgroundColor
    $lastBgColor = $sl.Colors.PromptBackgroundColor
    $prompt += Write-Prompt -Object $sl.PromptSymbols.SegmentForwardSymbol -ForegroundColor $lastBgColor

    # -------------------- 第二行 --------------------

    $ifHasVEnv = Test-VirtualEnv
    $status = Get-VCSStatus

    if ($ifHasVEnv -or $status) {
        # 开启新的一行
        $prompt += Set-Newline
    }

    # 第三部分: 虚拟环境 (比如conda)
    if ($ifHasVEnv) {
        $prompt = Write-Prompt -Object $sl.PromptSymbols.StartSymbol -ForegroundColor $sl.Colors.PromptForegroundColor -BackgroundColor $sl.Colors.SessionInfoBackgroundColor
        # 绘制
        $prompt += Write-Prompt -Object " env:$(Get-VirtualEnvName) " -ForegroundColor $sl.Colors.VirtualEnvForegroundColor -BackgroundColor $sl.Colors.VirtualEnvBackgroundColor
        $lastBgColor = $sl.Colors.VirtualEnvBackgroundColor
    }


    # git
    if ($status) {
        $themeInfo = Get-VcsInfo -status ($status)
        # 如果有虚拟环境，就需要把箭头画出来
        if ($ifHasVEnv) {
            $prompt += Write-Prompt -Object "$($sl.PromptSymbols.SegmentForwardSymbol) " -ForegroundColor $sl.Colors.VirtualEnvBackgroundColor -BackgroundColor $themeInfo.BackgroundColor
        }
        $lastBgColor = $themeInfo.BackgroundColor
        $prompt += Write-Prompt -Object " $($themeInfo.VcInfo) " -BackgroundColor $themeInfo.BackgroundColor -ForegroundColor $sl.Colors.GitForegroundColor
        # Writes the postfix to the prompt
        $prompt += Write-Prompt -Object $sl.PromptSymbols.SegmentForwardSymbol -ForegroundColor $lastBgColor
    }
    else {
        if ($ifHasVEnv) {
            $prompt += Write-Prompt -Object $sl.PromptSymbols.SegmentForwardSymbol -ForegroundColor $lastBgColor
        }
    }

    $timeStamp = Get-Date -UFormat %R
    $timestamp = "[$timeStamp]"

    $prompt += Set-CursorForRightBlockWrite -textLength ($timestamp.Length + 1)
    $prompt += Write-Prompt $timeStamp -ForegroundColor $sl.Colors.PromptForegroundColor

    $prompt += Set-Newline

    if ($with) {
        $prompt += Write-Prompt -Object "$($with.ToUpper()) " -BackgroundColor $sl.Colors.WithBackgroundColor -ForegroundColor $sl.Colors.WithForegroundColor
    }

    $prompt += Write-Prompt -Object $sl.PromptSymbols.PromptIndicator -ForegroundColor $sl.Colors.CommandFailedIconForegroundColor
    $prompt += Write-Prompt -Object $sl.PromptSymbols.PromptIndicator -ForegroundColor $sl.Colors.AdminIconForegroundColor
    $prompt += Write-Prompt -Object $sl.PromptSymbols.PromptIndicator -ForegroundColor $sl.Colors.GitNoLocalChangesAndAheadColor
    $prompt += ' '
    $prompt
}

$sl = $global:ThemeSettings #local settings
$sl.PromptSymbols.StartSymbol = ''
# $s1.PromptSymbols.VirtualEnvSymbol = [char]::ConvertFromUtf32(0xe0a2)
# > 符号
$sl.PromptSymbols.PromptIndicator = [char]::ConvertFromUtf32(0x276F)
# 实心右箭头符号
$sl.PromptSymbols.SegmentForwardSymbol = [char]::ConvertFromUtf32(0xE0B0)
$sl.Colors.PromptForegroundColor = [ConsoleColor]::White
$sl.Colors.PromptSymbolColor = [ConsoleColor]::White
$sl.Colors.PromptHighlightColor = [ConsoleColor]::DarkBlue
$sl.Colors.GitForegroundColor = [ConsoleColor]::Black
$sl.Colors.WithForegroundColor = [ConsoleColor]::DarkRed
$sl.Colors.WithBackgroundColor = [ConsoleColor]::Magenta
$sl.Colors.VirtualEnvBackgroundColor = [System.ConsoleColor]::Red
$sl.Colors.VirtualEnvForegroundColor = [System.ConsoleColor]::White
