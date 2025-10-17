import { Link } from "react-router-dom";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../hooks/useLanguage";
import type { UserInfo } from "../../types";
import type { Theme } from "../../hooks/useTheme";

interface HeaderProps {
  currentUser: UserInfo | null;
  isLoggedIn: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  showNewPageButton?: boolean;
  showMyPagesButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  avatarUrl?: string;
  onAvatarUpload?: (file: File) => void;
}

export default function Header({
  currentUser,
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
  showNewPageButton = false,
  showMyPagesButton = true,
  showEditButton = false,
  showDeleteButton = false,
  onEditClick,
  onDeleteClick,
  theme,
  onToggleTheme,
  avatarUrl,
  onAvatarUpload,
}: HeaderProps) {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) {
      onAvatarUpload(file);
    }
  };

  return (
    <header className="mb-16 text-center">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2 ">
        <div className="flex items-center justify-center sm:justify-start gap-3 ">
            <img
              src={"logo.svg"}
              alt="Linko Logo"
              className="w-16 h-16 rounded-lg object-cover bg-transparent"
            />
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--linktree-text-primary)" }}
          >
            linko
          </h1>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
          {!isLoggedIn && onLoginClick ? (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 border rounded-full hover:bg-gray-50 transition font-medium text-sm"
              style={{
                backgroundColor: "var(--linktree-surface)",
                color: "var(--linktree-text-primary)",
                borderColor: "var(--linktree-outline)",
              }}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              {t("header.login")}
            </button>
          ) : isLoggedIn && currentUser ? (
            <>
              {avatarUrl && (
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border-2 object-cover cursor-pointer hover:border-gray-300 transition"
                    style={{ borderColor: "var(--linktree-outline)" }}
                    onClick={() => avatarInputRef.current?.click()}
                  />
                  {onAvatarUpload && (
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  )}
                </div>
              )}
              <span
                className="text-sm"
                style={{ color: "var(--linktree-text-secondary)" }}
              >
                {t("header.hello", { name: currentUser.alias })}
              </span>
              {showMyPagesButton && (
                <Link
                  to="/my-pages"
                  className="px-3 py-2 border rounded-full hover:bg-gray-50 transition text-xs sm:text-sm font-medium no-underline"
                  style={{
                    backgroundColor: "var(--linktree-surface)",
                    color: "var(--linktree-text-primary)",
                    borderColor: "var(--linktree-outline)",
                  }}
                >
                  <i className="fas fa-folder-open mr-1 sm:mr-2"></i>
                  <span className="hidden sm:inline">
                    {t("header.myPages")}
                  </span>
                  <span className="sm:hidden">
                    {language === "en" ? "Pages" : "Pagine"}
                  </span>
                </Link>
              )}
              {showEditButton && onEditClick && (
                <button
                  onClick={onEditClick}
                  className="px-3 py-2 border rounded-full hover:bg-gray-50 transition text-xs sm:text-sm font-medium"
                  style={{
                    backgroundColor: "var(--linktree-surface)",
                    color: "var(--linktree-text-primary)",
                    borderColor: "var(--linktree-outline)",
                  }}
                >
                  <i className="fas fa-edit mr-1 sm:mr-2"></i>
                  <span className="hidden sm:inline">{t("header.edit")}</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              )}
              {showDeleteButton && onDeleteClick && (
                <button
                  onClick={onDeleteClick}
                  className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition text-xs sm:text-sm font-medium"
                >
                  <i className="fas fa-trash mr-1 sm:mr-2"></i>
                  <span className="hidden sm:inline">{t("header.delete")}</span>
                  <span className="sm:hidden">Del</span>
                </button>
              )}
              {onLogoutClick && !showEditButton && !showDeleteButton && (
                <button
                  onClick={onLogoutClick}
                  className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition text-xs sm:text-sm font-medium"
                >
                  <i className="fas fa-sign-out-alt mr-1"></i>
                  <span className="hidden sm:inline">{t("header.logout")}</span>
                  <span className="sm:hidden">Exit</span>
                </button>
              )}
            </>
          ) : null}

          {showNewPageButton && (
            <Link
              to="/"
              className="px-3 py-2 border rounded-full hover:bg-gray-50 transition text-xs sm:text-sm font-medium no-underline"
              style={{
                backgroundColor: "var(--linktree-surface)",
                color: "var(--linktree-text-primary)",
                borderColor: "var(--linktree-outline)",
              }}
            >
              <i className="fas fa-plus mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">{t("header.newPage")}</span>
              <span className="sm:hidden">
                {language === "en" ? "New" : "Nuova"}
              </span>
            </Link>
          )}

          <Link
            to="/about"
            className="px-3 py-2 border rounded-full hover:bg-gray-50 transition text-xs sm:text-sm font-medium no-underline"
            style={{
              backgroundColor: "var(--linktree-surface)",
              color: "var(--linktree-text-primary)",
              borderColor: "var(--linktree-outline)",
            }}
          >
            <i className="fas fa-info-circle mr-1 sm:mr-2"></i>
            <span className="hidden sm:inline">{t("header.about")}</span>
            <span className="sm:hidden">Info</span>
          </Link>

          <button
            onClick={onToggleTheme}
            className="px-3 py-2 border rounded-full hover:bg-gray-50 transition font-medium text-xs sm:text-sm"
            style={{
              backgroundColor: "var(--linktree-surface)",
              color: "var(--linktree-text-primary)",
              borderColor: "var(--linktree-outline)",
            }}
          >
            <i
              className={`fas fa-${
                theme === "dark" ? "sun" : "moon"
              } mr-1 sm:mr-2`}
            ></i>
            <span className="hidden sm:inline">
              {theme === "dark"
                ? t("header.theme.light")
                : t("header.theme.dark")}
            </span>
            <span className="sm:hidden">{theme === "dark" ? "☀️" : "🌙"}</span>
          </button>

          {/* Language Selector */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 border rounded-full hover:bg-gray-50 transition font-medium text-xs sm:text-sm"
            style={{
              backgroundColor: "var(--linktree-surface)",
              color: "var(--linktree-text-primary)",
              borderColor: "var(--linktree-outline)",
            }}
            title={
              language === "en" ? "Switch to Italian" : "Passa all'inglese"
            }
          >
            <i className="fas fa-language mr-1 sm:mr-2"></i>
            <span className="font-bold">{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
